'use client';

/**
 * Onboarding — engineering spec §7.1, product spec §6.
 *
 *   1. Company basics
 *   2. Capability profile
 *   3. Targets, picked from the DoD org tree
 *
 * "Step 3 is the moment the customer sees the org graph and understands what
 *  they're buying. Treat it as a feature, not a form."
 *
 * Acceptance criterion 1: the profile persists, and selecting a parent org
 * auto-includes its children as targets. The expansion happens server-side on
 * save (see the profile route) so what is stored matches what is scored; this
 * screen shows the count so the customer can see it happen.
 */
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/client-api';

interface Org {
  id: string;
  name: string;
  abbreviation: string | null;
  branch: string | null;
  parentId: string | null;
  description: string | null;
  childCount: number;
}

const SET_ASIDE_OPTIONS = [
  ['SB', 'Small Business'],
  ['8A', '8(a)'],
  ['HUBZONE', 'HUBZone'],
  ['SDVOSB', 'Service-Disabled Veteran-Owned'],
  ['VOSB', 'Veteran-Owned'],
  ['WOSB', 'Women-Owned'],
  ['EDWOSB', 'Economically Disadvantaged WOSB'],
  ['SDB', 'Small Disadvantaged Business'],
] as const;

/** Comma or newline separated free text -> a clean array. */
function parseList(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean))];
}

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Step 2
  const [naics, setNaics] = useState('');
  const [psc, setPsc] = useState('');
  const [setAsides, setSetAsides] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState('');
  const [capabilities, setCapabilities] = useState('');
  const [excluded, setExcluded] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [primePref, setPrimePref] = useState<'prime' | 'sub' | 'either'>('either');

  // Step 3
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [targetOrgIds, setTargetOrgIds] = useState<string[]>([]);
  const [orgSearch, setOrgSearch] = useState('');

  // Derived rather than a fourth piece of state. Setting a loading flag
  // synchronously inside the effect is the cascading-render hazard
  // react-hooks/set-state-in-effect exists to catch, and the condition is
  // fully determined by what we already track.
  const orgsLoading = step === 3 && orgs.length === 0 && !error;

  useEffect(() => {
    apiFetch<{ company: { id: string; name: string; onboardingComplete: boolean } | null }>('/api/companies')
      .then(({ company }) => {
        if (!company) return;
        setCompanyId(company.id);
        setName(company.name);
        if (company.onboardingComplete) router.push('/today');
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push('/login');
      });
  }, [router]);

  // The org tree loads when step 3 is first reached rather than up front —
  // most of the wait happens while the customer is filling in step 2.
  useEffect(() => {
    if (step !== 3 || orgs.length) return;

    let cancelled = false;

    (async () => {
      try {
        const { orgs: rows } = await apiFetch<{ orgs: Org[] }>('/api/org-tree');
        if (!cancelled) setOrgs(rows);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, orgs.length]);

  async function saveStep1() {
    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { id } = await apiFetch<{ id: string }>('/api/companies', {
        method: 'POST',
        body: JSON.stringify({ name, website, description }),
      });
      setCompanyId(id);
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile(complete: boolean) {
    if (!companyId) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/companies/${companyId}/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          naics_codes: parseList(naics),
          psc_codes: parseList(psc),
          set_asides: setAsides,
          vehicles: parseList(vehicles),
          capabilities: parseList(capabilities),
          excluded_keywords: parseList(excluded),
          min_value: minValue || null,
          max_value: maxValue || null,
          prime_pref: primePref,
          target_org_ids: targetOrgIds,
          complete_onboarding: complete,
        }),
      });
      if (complete) router.push('/today');
      else setStep(3);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const grouped = useMemo(() => {
    const query = orgSearch.trim().toLowerCase();
    const filtered = query
      ? orgs.filter(
          (o) =>
            o.name.toLowerCase().includes(query) ||
            (o.abbreviation ?? '').toLowerCase().includes(query),
        )
      : orgs;

    const byBranch = new Map<string, Org[]>();
    for (const org of filtered) {
      const branch = org.branch ?? 'Other';
      if (!byBranch.has(branch)) byBranch.set(branch, []);
      byBranch.get(branch)!.push(org);
    }
    return [...byBranch.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [orgs, orgSearch]);

  function toggleOrg(id: string) {
    setTargetOrgIds((current) =>
      current.includes(id) ? current.filter((o) => o !== id) : [...current, id],
    );
  }

  return (
    <div className="v3-page v3-onboarding">
      <header className="v3-header">
        <div>
          <h1 className="v3-title">Set up War Room</h1>
          <p className="v3-muted">Three steps. This is what every match is scored against.</p>
        </div>
      </header>

      <ol className="v3-steps">
        {['Company', 'Capabilities', 'Targets'].map((label, i) => (
          <li key={label} className={`v3-step${step === i + 1 ? ' on' : ''}${step > i + 1 ? ' done' : ''}`}>
            <span className="v3-step-n">{i + 1}</span> {label}
          </li>
        ))}
      </ol>

      {error && <div className="v3-error" role="alert">{error}</div>}

      {step === 1 && (
        <section className="v3-form">
          <h2>Company basics</h2>
          <label className="v3-field">
            <span>Company name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Meridian Defense Systems" />
          </label>
          <label className="v3-field">
            <span>Website</span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </label>
          <label className="v3-field">
            <span>What do you do?</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cloud migration and zero trust engineering for defense agencies."
            />
          </label>
          <div className="v3-form-actions">
            <button className="v3-btn v3-btn-primary" disabled={saving} onClick={saveStep1}>
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="v3-form">
          <h2>Capability profile</h2>
          <p className="v3-muted">
            Every one of these becomes a scoring factor. Exclusions are the strongest: anything matching them is never
            shown to you at all.
          </p>

          <label className="v3-field">
            <span>NAICS codes</span>
            <input value={naics} onChange={(e) => setNaics(e.target.value)} placeholder="541512, 541519" />
          </label>
          <label className="v3-field">
            <span>PSC codes</span>
            <input value={psc} onChange={(e) => setPsc(e.target.value)} placeholder="D399, R425" />
          </label>

          <fieldset className="v3-field">
            <legend>Set-asides you hold</legend>
            <div className="v3-checks">
              {SET_ASIDE_OPTIONS.map(([value, label]) => (
                <label key={value} className="v3-check">
                  <input
                    type="checkbox"
                    checked={setAsides.includes(value)}
                    onChange={() =>
                      setSetAsides((current) =>
                        current.includes(value) ? current.filter((s) => s !== value) : [...current, value],
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="v3-field">
            <span>Contract vehicles</span>
            <input value={vehicles} onChange={(e) => setVehicles(e.target.value)} placeholder="SEWP VI, CIO-SP4" />
          </label>
          <label className="v3-field">
            <span>Capabilities and keywords</span>
            <textarea
              rows={3}
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              placeholder="cloud migration, zero trust, DevSecOps"
            />
          </label>
          <label className="v3-field">
            <span>Never show me work involving…</span>
            <textarea
              rows={2}
              value={excluded}
              onChange={(e) => setExcluded(e.target.value)}
              placeholder="janitorial, grounds maintenance, food service"
            />
          </label>

          <div className="v3-field-row">
            <label className="v3-field">
              <span>Smallest contract worth your time</span>
              <input
                type="number"
                min="0"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="500000"
              />
            </label>
            <label className="v3-field">
              <span>Largest you can deliver</span>
              <input
                type="number"
                min="0"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="15000000"
              />
            </label>
          </div>

          <label className="v3-field">
            <span>Prime or sub</span>
            <select value={primePref} onChange={(e) => setPrimePref(e.target.value as typeof primePref)}>
              <option value="either">Either</option>
              <option value="prime">Prime only</option>
              <option value="sub">Sub only</option>
            </select>
          </label>

          <div className="v3-form-actions">
            <button className="v3-btn v3-btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="v3-btn v3-btn-primary" disabled={saving} onClick={() => saveProfile(false)}>
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="v3-form">
          <h2>Who do you sell to?</h2>
          <p className="v3-muted">
            Pick the commands and agencies you target. Choosing a parent includes everything under it — this is the org
            graph the rest of the product is built on.
          </p>

          <label className="v3-field">
            <span>Search</span>
            <input
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
              placeholder="DISA, Air Force, CYBERCOM…"
            />
          </label>

          {orgsLoading && <p className="v3-muted">Loading the org tree…</p>}

          <div className="v3-orgpick">
            {grouped.map(([branch, branchOrgs]) => (
              <div key={branch} className="v3-orgpick-group">
                <h3>{branch}</h3>
                <div className="v3-checks">
                  {branchOrgs.map((org) => (
                    <label key={org.id} className="v3-check v3-check-org">
                      <input
                        type="checkbox"
                        checked={targetOrgIds.includes(org.id)}
                        onChange={() => toggleOrg(org.id)}
                      />
                      <span>
                        {org.abbreviation ?? org.name}
                        {org.childCount > 0 && (
                          <span className="v3-muted"> · {org.childCount} below</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="v3-muted">
            {targetOrgIds.length
              ? `${targetOrgIds.length} selected. Everything beneath them is included automatically.`
              : 'Nothing selected yet. You can change this any time in settings.'}
          </p>

          <div className="v3-form-actions">
            <button className="v3-btn v3-btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button className="v3-btn v3-btn-primary" disabled={saving} onClick={() => saveProfile(true)}>
              {saving ? 'Saving…' : 'Finish setup'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
