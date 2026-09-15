'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  full_name: string;
  company: string | null;
  created_at: string;
  last_login: string | null;
}

export default function AccountPage() {
  const router = useRouter();

  /* allow page-level scroll instead of inner-div scroll */
  useEffect(() => {
    document.body.setAttribute('data-page', 'account');
    return () => document.body.removeAttribute('data-page');
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* profile form */
  const [fullName, setFullName] = useState('');
  const [company, setCompany]   = useState('');
  const [email, setEmail]       = useState('');
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  /* password form */
  const [curPw, setCurPw]   = useState('');
  const [newPw, setNewPw]   = useState('');
  const [confPw, setConfPw] = useState('');
  const [pwMsg, setPwMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  function token() { return typeof window !== 'undefined' ? localStorage.getItem('wr_token') ?? '' : ''; }

  useEffect(() => {
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((u: User) => {
        setUser(u);
        setFullName(u.full_name);
        setCompany(u.company ?? '');
        setEmail(u.email);
        setLoading(false);
      })
      .catch(() => { router.push('/login'); });
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null); setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ full_name: fullName, company, email }),
      });
      const data = await res.json();
      if (!res.ok) { setProfileMsg({ ok: false, text: data.error || 'Update failed' }); }
      else { setUser(u => u ? { ...u, ...data } : u); setProfileMsg({ ok: true, text: 'Profile updated.' }); }
    } catch { setProfileMsg({ ok: false, text: 'Network error.' }); }
    setProfileSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confPw) { setPwMsg({ ok: false, text: 'Passwords do not match.' }); return; }
    setPwMsg(null); setPwSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ current_password: curPw, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwMsg({ ok: false, text: data.error || 'Failed to change password.' }); }
      else { setPwMsg({ ok: true, text: 'Password changed successfully.' }); setCurPw(''); setNewPw(''); setConfPw(''); }
    } catch { setPwMsg({ ok: false, text: 'Network error.' }); }
    setPwSaving(false);
  }

  function signOut() {
    localStorage.removeItem('wr_token');
    router.push('/login');
  }

  if (loading) return <div className="acct-loading">Loading…</div>;

  return (
    <div className="acct-wrap">
      <div className="acct-header">
        <div className="acct-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className="acct-name">{user?.full_name}</h1>
          <p className="acct-email">{user?.email}</p>
          {user?.last_login && (
            <p className="acct-meta">Last sign-in {new Date(user.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          )}
        </div>
      </div>

      <div className="acct-sections">

        {/* Profile */}
        <section className="acct-card">
          <h2 className="acct-card-title">Profile</h2>
          <form onSubmit={saveProfile} className="acct-form">
            <div className="acct-field">
              <label>Full name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="acct-field">
              <label>Organization / Company</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Optional" />
            </div>
            <div className="acct-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {profileMsg && <div className={`acct-msg ${profileMsg.ok ? 'ok' : 'err'}`}>{profileMsg.text}</div>}
            <div className="acct-form-footer">
              <button type="submit" className="acct-btn primary" disabled={profileSaving}>
                {profileSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        {/* Password */}
        <section className="acct-card">
          <h2 className="acct-card-title">Change password</h2>
          <form onSubmit={changePassword} className="acct-form">
            <div className="acct-field">
              <label>Current password</label>
              <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="acct-field">
              <label>New password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
            </div>
            <div className="acct-field">
              <label>Confirm new password</label>
              <input type="password" value={confPw} onChange={e => setConfPw(e.target.value)} placeholder="••••••••" required />
            </div>
            {pwMsg && <div className={`acct-msg ${pwMsg.ok ? 'ok' : 'err'}`}>{pwMsg.text}</div>}
            <div className="acct-form-footer">
              <button type="submit" className="acct-btn primary" disabled={pwSaving}>
                {pwSaving ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>

        {/* Session */}
        <section className="acct-card acct-card--danger">
          <h2 className="acct-card-title">Session</h2>
          <p className="acct-card-desc">Sign out of your War Room account on this device.</p>
          <button className="acct-btn danger" onClick={signOut}>Sign out</button>
        </section>

      </div>
    </div>
  );
}
