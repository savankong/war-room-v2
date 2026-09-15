import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BriefSchema, validateBrief, MAX_PEOPLE, type BriefOutput } from './schema';

function brief(overrides: Partial<BriefOutput> = {}): BriefOutput {
  return {
    summary: 'DISA posted a Sources Sought for enterprise cloud migration support.',
    why_it_matters: ['Same NAICS as three of your past contracts.'],
    recommendation: 'position_now',
    recommendation_rationale: ['Pre-RFP, so the requirement is still being shaped.'],
    people: [{ person_id: 'p1', why: 'Contracting Officer at DISA.', suggested_action: 'Introduce the company.' }],
    next_action: 'Respond to the Sources Sought before 30 September.',
    ...overrides,
  };
}

const context = {
  candidatePersonIds: new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']),
  hasIncumbent: true,
  incumbentRecipient: 'Acme Systems',
};

describe('BriefSchema', () => {
  test('accepts a well-formed brief', () => {
    assert.doesNotThrow(() => BriefSchema.parse(brief()));
  });

  test('rejects an unknown recommendation', () => {
    assert.throws(() => BriefSchema.parse(brief({ recommendation: 'maybe' as never })));
  });

  test('rejects a person without a person_id', () => {
    assert.throws(() =>
      BriefSchema.parse(brief({ people: [{ why: 'x', suggested_action: 'y' } as never] })),
    );
  });
});

describe('validateBrief — no invented people (§6, acceptance criterion 7)', () => {
  test('passes when every person_id is from the candidate list', () => {
    assert.deepEqual(validateBrief(brief(), context), []);
  });

  test('fails on a person_id that was never supplied', () => {
    const failures = validateBrief(
      brief({ people: [{ person_id: 'made-up', why: 'x', suggested_action: 'y' }] }),
      context,
    );
    assert.equal(failures.length, 1);
    assert.equal(failures[0].rule, 'unknown_person_id');
  });

  test('fails when the same person is listed twice', () => {
    const failures = validateBrief(
      brief({
        people: [
          { person_id: 'p1', why: 'a', suggested_action: 'b' },
          { person_id: 'p1', why: 'c', suggested_action: 'd' },
        ],
      }),
      context,
    );
    assert.ok(failures.some((f) => f.rule === 'duplicate_person'));
  });

  test('fails above the five-person cap', () => {
    const people = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((id) => ({
      person_id: id,
      why: 'x',
      suggested_action: 'y',
    }));
    const failures = validateBrief(brief({ people }), context);
    assert.ok(failures.some((f) => f.rule === 'too_many_people'));
    assert.equal(MAX_PEOPLE, 5);
  });
});

describe('validateBrief — no numeric probabilities (§8 rule 2)', () => {
  test('fails on a percentage', () => {
    const failures = validateBrief(brief({ summary: 'We estimate a 73.4% chance of winning.' }), context);
    assert.ok(failures.some((f) => f.rule === 'percentage'));
  });

  test('fails on the word percent', () => {
    const failures = validateBrief(brief({ next_action: 'Roughly 60 percent likely to convert.' }), context);
    assert.ok(failures.some((f) => f.rule === 'percentage'));
  });

  test('fails on a win-probability phrase without a number', () => {
    const failures = validateBrief(
      brief({ recommendation_rationale: ['Win probability here is favourable.'] }),
      context,
    );
    assert.ok(failures.some((f) => f.rule === 'probability'));
  });

  test('allows a real contract value', () => {
    // The rule is about fake precision, not about digits.
    const failures = validateBrief(
      brief({ why_it_matters: ['The prior contract obligated $4.2M through 2027.'] }),
      context,
    );
    assert.deepEqual(failures, []);
  });

  test('allows a NAICS code', () => {
    const failures = validateBrief(brief({ why_it_matters: ['Same NAICS 541512 as your past work.'] }), context);
    assert.deepEqual(failures, []);
  });
});

describe('validateBrief — no invented incumbent (§8 rule 1)', () => {
  const noIncumbent = { ...context, hasIncumbent: false, incumbentRecipient: null };

  test('fails when a brief names an incumbent that was never supplied', () => {
    const failures = validateBrief(
      brief({ why_it_matters: ['The incumbent is Acme Systems, in place since 2021.'] }),
      noIncumbent,
    );
    assert.ok(failures.some((f) => f.rule === 'invented_incumbent'));
  });

  test('fails on "currently held by" with no incumbent in context', () => {
    const failures = validateBrief(
      brief({ summary: 'This work is currently held by a large prime.' }),
      noIncumbent,
    );
    assert.ok(failures.some((f) => f.rule === 'invented_incumbent'));
  });

  test('allows saying plainly that no incumbent was found', () => {
    const failures = validateBrief(
      brief({ why_it_matters: ['No prior contract was identified, so there is no incumbent read.'] }),
      noIncumbent,
    );
    assert.deepEqual(failures, []);
  });

  test('allows naming the incumbent when one WAS supplied', () => {
    const failures = validateBrief(
      brief({ why_it_matters: ['The incumbent is Acme Systems and the contract ends in March.'] }),
      context,
    );
    assert.deepEqual(failures, []);
  });
});

describe('validateBrief — completeness', () => {
  test('fails on an empty summary', () => {
    const failures = validateBrief(brief({ summary: '   ' }), context);
    assert.ok(failures.some((f) => f.rule === 'empty_summary'));
  });

  test('fails on an empty next action', () => {
    const failures = validateBrief(brief({ next_action: '' }), context);
    assert.ok(failures.some((f) => f.rule === 'empty_next_action'));
  });

  test('reports every failure at once, so one retry can fix them all', () => {
    const failures = validateBrief(
      brief({
        summary: 'A 90% chance of success.',
        people: [{ person_id: 'nope', why: 'x', suggested_action: 'y' }],
        next_action: '',
      }),
      context,
    );
    const rules = new Set(failures.map((f) => f.rule));
    assert.ok(rules.has('percentage'));
    assert.ok(rules.has('unknown_person_id'));
    assert.ok(rules.has('empty_next_action'));
  });
});
