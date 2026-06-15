'use client';
import { useState } from 'react';
import Link from 'next/link';
import { WRMark } from '@/components/WRLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [token, setToken]     = useState('');
  const [newPw, setNewPw]     = useState('');
  const [confirmPw, setConfirm] = useState('');
  const [step, setStep]       = useState<'request' | 'confirm' | 'done'>('request');
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Request failed.'); setLoading(false); return; }
      if (data.token) { setToken(data.token); setStep('confirm'); }
      else { setMsg(data.message || 'Check your email for a reset link.'); setStep('done'); }
    } catch { setError('Network error.'); }
    setLoading(false);
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }
    if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password?action=confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Reset failed.'); setLoading(false); return; }
      setMsg(data.message || 'Password updated. You can now sign in.');
      setStep('done');
    } catch { setError('Network error.'); }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <WRMark size={36} />
          <span className="auth-logo-text">War Room</span>
        </div>

        {step === 'request' && (
          <>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link.</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={requestReset}>
              <div className="auth-field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus />
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="auth-foot"><Link href="/login">← Back to sign in</Link></p>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle">Enter a new password for your account.</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={confirmReset}>
              <div className="auth-field">
                <label>New password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" required autoFocus />
              </div>
              <div className="auth-field">
                <label>Confirm password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Updating…' : 'Set new password'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h2>Done</h2>
            <p>{msg}</p>
            <Link href="/login" className="btn-auth" style={{display:'block',textAlign:'center',textDecoration:'none',marginTop:20}}>
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
