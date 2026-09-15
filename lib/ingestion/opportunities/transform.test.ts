import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { transformOpportunity, stripHtml } from './transform';
import type { SamOpportunity } from './fetch';

function notice(overrides: Partial<SamOpportunity> = {}): SamOpportunity {
  return {
    noticeId: 'abc123',
    title: 'Enterprise Cloud Migration Support',
    type: 'Sources Sought',
    naicsCode: '541512',
    classificationCode: 'D399',
    solicitationNumber: 'FA4600-26-R-0001',
    postedDate: '2026-09-01',
    responseDeadLine: '2026-09-30T17:00:00-04:00',
    fullParentPathName: 'DEPT OF DEFENSE.DEPT OF THE AIR FORCE.AFLCMC',
    fullParentPathCode: '057.5700.FA4600',
    typeOfSetAsideDesc: 'Total Small Business Set-Aside',
    ...overrides,
  };
}

describe('transformOpportunity', () => {
  test('maps the core SAM fields', () => {
    const row = transformOpportunity(notice());
    assert.equal(row.external_id, 'abc123');
    assert.equal(row.source, 'sam');
    assert.equal(row.naics_code, '541512');
    assert.equal(row.psc_code, 'D399');
    assert.equal(row.set_aside, 'Total Small Business Set-Aside');
    assert.equal(row.notice_type, 'Sources Sought');
  });

  test('takes the department from the first path segment and the office from the last', () => {
    const row = transformOpportunity(notice());
    assert.equal(row.department_slug, 'DEPT OF DEFENSE');
    assert.equal(row.office_name, 'AFLCMC');
  });

  test('leaves office_name null when the path has only a department', () => {
    const row = transformOpportunity(notice({ fullParentPathName: 'DEPT OF DEFENSE' }));
    assert.equal(row.department_slug, 'DEPT OF DEFENSE');
    assert.equal(row.office_name, null);
  });

  test('stores a noticedesc URL as null rather than as prose', () => {
    // v2 stored these verbatim, which is what produced descriptions that
    // rendered as a bare URL or hung on "Loading description…".
    const row = transformOpportunity(
      notice({ description: 'https://api.sam.gov/prod/opportunity/v1/api/noticedesc?noticeid=abc123' }),
    );
    assert.equal(row.description, null);
  });

  test('strips HTML from a real description', () => {
    const row = transformOpportunity(
      notice({ description: '<p>Seeking <b>cloud</b> migration support.</p><br/>Responses due soon.' }),
    );
    assert.equal(row.description, 'Seeking cloud migration support.\n\nResponses due soon.');
  });

  test('normalizes both SAM date formats', () => {
    assert.equal(transformOpportunity(notice({ postedDate: '09/15/2026' })).posted_date, '2026-09-15');
    assert.equal(transformOpportunity(notice({ postedDate: '2026-09-15' })).posted_date, '2026-09-15');
  });

  test('returns null for an unparseable date instead of Invalid Date', () => {
    assert.equal(transformOpportunity(notice({ postedDate: 'not a date' })).posted_date, null);
    assert.equal(transformOpportunity(notice({ responseDeadLine: '' })).response_deadline, null);
  });

  test('parses an award amount given as a formatted string', () => {
    const row = transformOpportunity(notice({ award: { amount: '$1,250,000' } }));
    assert.equal(row.estimated_value, 1250000);
  });

  test('leaves estimated_value null when SAM gives no amount', () => {
    assert.equal(transformOpportunity(notice()).estimated_value, null);
  });

  test('prefers the primary point of contact', () => {
    const row = transformOpportunity(
      notice({
        pointOfContact: [
          { type: 'secondary', fullName: 'Second Contact', email: 'Second@us.af.mil' },
          { type: 'primary', fullName: 'First Contact', email: 'First@us.af.mil' },
        ],
      }),
    );
    assert.equal(row.poc_name, 'First Contact');
    assert.equal(row.poc_email, 'first@us.af.mil');
  });

  test('falls back to a placeholder title rather than writing NOT NULL null', () => {
    const row = transformOpportunity(notice({ title: '   ' }));
    assert.equal(row.title, '(untitled notice)');
  });
});

describe('stripHtml', () => {
  test('passes plain text through', () => {
    assert.equal(stripHtml('Plain text'), 'Plain text');
  });

  test('decodes entities', () => {
    assert.equal(stripHtml('<p>R&amp;D services &quot;as needed&quot;</p>'), 'R&D services "as needed"');
  });

  test('returns null for empty input', () => {
    assert.equal(stripHtml(''), null);
    assert.equal(stripHtml(null), null);
    assert.equal(stripHtml('   '), null);
  });
});
