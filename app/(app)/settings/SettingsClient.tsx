'use client';

/**
 * Settings and billing — engineering spec §7.4.
 * "Profile edit, briefing frequency, Stripe portal link."
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/client-api';

interface Company {
  id: string;
  name: string;
  plan: string;
  status: string;
}

interface Profile {
  naics_codes: string[];
  psc_codes: string[];
  set_asides: string[];
  vehicles: string[];
  capabilities: string[];
  excluded_keywords: string[];
  target_org_ids: string[];
  min_value: string | null;
  max_value: string | null;
  prime_pref: 'prime' | 'sub' | 'either';
}

function joinList(values: string[] | null | undefined): string {
  return (values ?? []).join(', ');
}

function parseList(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean))];
}

export default function SettingsClient() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [frequency, setFrequency] = useState<'mwf' | 'weekly' | 'off'>('mwf');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [naics, setNaics] = useState('');
  const [psc, setPsc] = useState('');
  const [capabilities, setCapabilities] = useState('');
  const [excluded, setExcluded] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { company: found } = await apiFetch<{ company: (Company & { briefing_frequency?: string }) | null }>(
          '/api/companies',
        );
        if (cancelled) return;

        if (!found) {
          router.push('/onboarding');
          return;
        }
        setCompany(found);

        const { profile: p } = await apiFetch<{ profile: Profile | null }>(`/api/companies/${found.id}/profile`);
        if (cancelled) return;

        if (p) {
          setProfile(p);
          setNaics(joinList(p.naics_codes));
          setPsc(joinList(p.psc_codes));
          setCapabilities(joinList(p.capabilities));
          setExcluded(joinList(p.excluded_keywords));
          setMinValue(p.min_value ?? '');
          setMaxValue(p.max_value ?? '');
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.push('/login');
          return;
        }
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveProfile() {
    if (!company || !profile) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await apiFetch(`/api/companies/${company.id}/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          ...profile,
          naics_codes: parseList(naics),
          psc_codes: parseList(psc),
          capabilities: parseList(capabilities),
          excluded_keywords: parseList(excluded),
          min_value: minValue || null,
          max_value: maxValue || null,
        }),
      });
      setMessage('Saved. Your next scoring run picks this up.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function startCheckout() {
    if (!company) return;
    setSaving(true);
    try {
      const { url } = await apiFetch<{ url: string }>('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ companyId: company.id }),
      });
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  async function openPortal() {
    if (!company) return;
    setSaving(true);
    try {
      const { url } = await apiFetch<{ url: string }>('/api/stripe/checkout', {
        method: 'PUT',
        body: JSON.stringify({ companyId: company.id }),
      });
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (loading) return <div className="v3-page"><p className="v3-muted">Loading…</p></div>;

  return (
    <div className="v3-page">
      <header className="v3-header">
        <div>
          <h1 className="v3-title">Settings</h1>
          <p className="v3-muted">{company?.name}</p>
        </div>
        <Link href="/today" className="v3-btn v3-btn-ghost">Back to Today</Link>
      </header>

      {error && <div className="v3-error" role="alert">{error}</div>}
      {message && <div className="v3-notice">{message}</div>}

      <section className="v3-form">
        <h2>Capability profile</h2>
        <label className="v3-field">
          <span>NAICS codes</span>
          <input value={naics} onChange={(e) => setNaics(e.target.value)} />
        </label>
        <label className="v3-field">
          <span>PSC codes</span>
          <input value={psc} onChange={(e) => setPsc(e.target.value)} />
        </label>
        <label className="v3-field">
          <span>Capabilities and keywords</span>
          <textarea rows={3} value={capabilities} onChange={(e) => setCapabilities(e.target.value)} />
        </label>
        <label className="v3-field">
          <span>Never show me work involving…</span>
          <textarea rows={2} value={excluded} onChange={(e) => setExcluded(e.target.value)} />
        </label>
        <div className="v3-field-row">
          <label className="v3-field">
            <span>Minimum contract value</span>
            <input type="number" min="0" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
          </label>
          <label className="v3-field">
            <span>Maximum contract value</span>
            <input type="number" min="0" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
          </label>
        </div>
        <div className="v3-form-actions">
          <button className="v3-btn v3-btn-primary" disabled={saving} onClick={saveProfile}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </section>

      <section className="v3-form">
        <h2>Briefing</h2>
        <label className="v3-field">
          <span>How often</span>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)}>
            <option value="mwf">Monday, Wednesday, Friday</option>
            <option value="weekly">Mondays only</option>
            <option value="off">Turn off</option>
          </select>
        </label>
        <p className="v3-muted">
          Never more than three opportunities per email, whatever the cadence. If more qualify, the briefing says how
          many are waiting in the app.
        </p>
      </section>

      <section className="v3-form">
        <h2>Billing</h2>
        <p>
          Plan: <strong>{company?.plan === 'capture' ? 'Capture — $149/month' : company?.plan ?? 'trial'}</strong>
        </p>
        <div className="v3-form-actions">
          {company?.plan === 'capture' ? (
            <button className="v3-btn v3-btn-ghost" disabled={saving} onClick={openPortal}>
              Manage billing
            </button>
          ) : (
            <button className="v3-btn v3-btn-primary" disabled={saving} onClick={startCheckout}>
              Start subscription — $149/month
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
