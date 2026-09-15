import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isDodNotice, isPreRfp, isSolicitation, isRfi } from './dod-scope';

describe('isDodNotice', () => {
  test('matches on the toptier department code', () => {
    assert.equal(isDodNotice('057.5700.FA4600', null), true);
    assert.equal(isDodNotice('021.2100.W91QUZ', null), true);
    assert.equal(isDodNotice('097.9700.HC1028', null), true);
    assert.equal(isDodNotice('017.1700.N00189', null), true);
  });

  test('rejects civilian department codes', () => {
    assert.equal(isDodNotice('070.7000.HSCG', null), false); // DHS
    assert.equal(isDodNotice('036.3600.VA248', null), false); // VA
  });

  test('falls back to the department name when no code is present', () => {
    assert.equal(isDodNotice(null, 'DEPT OF DEFENSE.DEFENSE LOGISTICS AGENCY.DLA LAND'), true);
    assert.equal(isDodNotice('', 'DEPARTMENT OF THE NAVY.NAVSEA'), true);
  });

  test('rejects a civilian agency whose name merely mentions defense', () => {
    // The point of an explicit list: a substring match on "defense" alone
    // would pull this in.
    assert.equal(
      isDodNotice('070.7000.HSCG', 'DEPT OF HOMELAND SECURITY.OFFICE OF DEFENSE COORDINATION'),
      false,
    );
  });

  test('rejects when both inputs are empty', () => {
    assert.equal(isDodNotice(null, null), false);
    assert.equal(isDodNotice('', ''), false);
  });
});

describe('pre-RFP classification', () => {
  test('identifies the pre-RFP notice types', () => {
    assert.equal(isPreRfp('Sources Sought'), true);
    assert.equal(isPreRfp('Presolicitation'), true);
    assert.equal(isPreRfp('Special Notice'), true);
    assert.equal(isPreRfp('Request for Information'), true);
  });

  test('a combined synopsis is a solicitation, not pre-RFP', () => {
    // It contains the word "solicitation", so ordering inside isPreRfp matters.
    assert.equal(isPreRfp('Combined Synopsis/Solicitation'), false);
    assert.equal(isSolicitation('Combined Synopsis/Solicitation'), true);
  });

  test('a plain solicitation is not pre-RFP', () => {
    assert.equal(isPreRfp('Solicitation'), false);
    assert.equal(isSolicitation('Solicitation'), true);
  });

  test('handles null and unknown types', () => {
    assert.equal(isPreRfp(null), false);
    assert.equal(isSolicitation(null), false);
    assert.equal(isPreRfp('Award Notice'), false);
    assert.equal(isSolicitation('Award Notice'), false);
  });
});

describe('isRfi', () => {
  test('finds RFIs posted under another notice type', () => {
    assert.equal(isRfi('Sources Sought', 'RFI - Enterprise Cloud Migration Support'), true);
    assert.equal(isRfi('Special Notice', 'Request for Information: Cyber Range'), true);
  });

  test('does not fire on unrelated titles', () => {
    assert.equal(isRfi('Solicitation', 'Aircraft Maintenance Services'), false);
  });

  test('does not match rfi inside a longer word', () => {
    assert.equal(isRfi('Solicitation', 'Airfield Perimeter Fencing'), false);
  });
});
