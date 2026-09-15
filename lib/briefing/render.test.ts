import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderSubject, renderText, renderHtml } from './render';
import { MAX_OPPORTUNITIES, type BriefingPayload } from './build';

function payload(overrides: Partial<BriefingPayload> = {}): BriefingPayload {
  return {
    companyName: 'Meridian Defense Systems',
    periodStart: '2026-09-08',
    periodEnd: '2026-09-15',
    opportunities: [
      {
        opportunityId: 'o1',
        title: 'Enterprise Cloud Migration Support',
        org: 'DISA',
        noticeType: 'Sources Sought',
        estimatedValue: 4_000_000,
        responseDeadline: '2026-09-30',
        fit: 'strong',
        evidence: ['Same NAICS as 3 of your past contracts (541512)', 'You have past performance with DISA'],
        nextAction: 'Respond to the Sources Sought before 30 September.',
        incumbent: 'Acme Systems',
        briefUrl: 'https://warroomusa.com/brief/o1',
      },
    ],
    totalAvailable: 1,
    recompete: null,
    people: [],
    signals: [],
    ...overrides,
  };
}

describe('renderSubject (§9)', () => {
  test('matches the spec format', () => {
    assert.equal(renderSubject(payload()), '1 thing worth your attention, week of September 15');
  });

  test('pluralizes correctly', () => {
    const three = payload({
      opportunities: [payload().opportunities[0], payload().opportunities[0], payload().opportunities[0]],
    });
    assert.equal(renderSubject(three), '3 things worth your attention, week of September 15');
  });

  test('says so plainly when there is nothing', () => {
    assert.match(renderSubject(payload({ opportunities: [] })), /^Nothing urgent this week/);
  });
});

describe('renderText (§9)', () => {
  test('includes the title, org, notice type, value and deadline', () => {
    const text = renderText(payload());
    assert.match(text, /Enterprise Cloud Migration Support/);
    assert.match(text, /DISA/);
    assert.match(text, /Sources Sought/);
    assert.match(text, /\$4M/);
    assert.match(text, /responses due 2026-09-30/);
  });

  test('renders the evidence lines', () => {
    const text = renderText(payload());
    assert.match(text, /Same NAICS as 3 of your past contracts/);
    assert.match(text, /You have past performance with DISA/);
  });

  test('every opportunity links to its capture brief', () => {
    // Acceptance criterion 8: "every link resolves".
    const text = renderText(payload());
    assert.match(text, /https:\/\/warroomusa\.com\/brief\/o1/);
  });

  test('says how many matches were held back (§9)', () => {
    // "If there are nine Strong matches, send three and say so."
    const text = renderText(payload({ totalAvailable: 9 }));
    assert.match(text, /8 more matches cleared the bar/);
  });

  test('says nothing about held-back matches when there are none', () => {
    assert.doesNotMatch(renderText(payload()), /more match/);
  });

  test('renders the recompete section when there is one', () => {
    const text = renderText(
      payload({
        recompete: {
          contractTitle: 'Cloud Infrastructure Services',
          org: 'DISA',
          incumbent: 'Acme Systems',
          endDate: '2027-03-31',
          totalObligation: 12_000_000,
          why: 'Expires 2027-03-31. Positioning for a recompete starts 12 to 18 months out, which is now.',
        },
      }),
    );
    assert.match(text, /RECOMPETE TO START POSITIONING FOR/);
    assert.match(text, /Acme Systems/);
    assert.match(text, /\$12M obligated/);
  });

  test('omits empty sections rather than printing headers with nothing under them', () => {
    const text = renderText(payload());
    assert.doesNotMatch(text, /RECOMPETE TO START POSITIONING FOR/);
    assert.doesNotMatch(text, /PEOPLE YOU SHOULD KNOW/);
    assert.doesNotMatch(text, /SIGNALS/);
  });

  test('caps signals at four lines (§9)', () => {
    const signals = Array.from({ length: 4 }, (_, i) => ({ type: 'new_award', line: `Signal ${i}` }));
    const text = renderText(payload({ signals }));
    const lines = text.split('\n').filter((l) => l.startsWith('- Signal'));
    assert.equal(lines.length, 4);
  });

  test('contains no percentage anywhere (§8 rule 2)', () => {
    const text = renderText(
      payload({
        totalAvailable: 9,
        people: [{ personId: 'p1', name: 'Dana Reyes', title: 'Contracting Officer', org: 'DISA', why: 'Owns this buy.' }],
        signals: [{ type: 'new_award', line: 'DISA: Acme won Cloud Services at $9M' }],
      }),
    );
    assert.doesNotMatch(text, /\d+(\.\d+)?\s*%/);
  });

  test('an empty week reads as a real answer, not an empty inbox', () => {
    const text = renderText(payload({ opportunities: [], totalAvailable: 0 }));
    assert.match(text, /Nothing crossed the bar this week/);
    assert.match(text, /rather send you nothing than pad it out/);
  });
});

describe('renderHtml (§9)', () => {
  test('is near-text: no images and no table layout', () => {
    const html = renderHtml(payload());
    assert.doesNotMatch(html, /<img/i);
    assert.doesNotMatch(html, /<table/i);
  });

  test('turns brief URLs into real links', () => {
    const html = renderHtml(payload());
    assert.match(html, /<a href="https:\/\/warroomusa\.com\/brief\/o1"/);
  });

  test('escapes HTML in content rather than rendering it', () => {
    const html = renderHtml(
      payload({
        opportunities: [{ ...payload().opportunities[0], title: 'Support <script>alert(1)</script>' }],
      }),
    );
    assert.doesNotMatch(html, /<script>alert/);
    assert.match(html, /&lt;script&gt;/);
  });

  test('carries the same content as the text version', () => {
    const html = renderHtml(payload());
    assert.match(html, /Enterprise Cloud Migration Support/);
    assert.match(html, /Same NAICS as 3 of your past contracts/);
  });
});

describe('the three-opportunity cap (§9)', () => {
  test('MAX_OPPORTUNITIES is three', () => {
    assert.equal(MAX_OPPORTUNITIES, 3);
  });
});
