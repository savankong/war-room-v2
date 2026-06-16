'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AegisMark } from '@/components/Aegis';

function GoogleErrorReader({ onError }: { onError: (msg: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'google_cancelled') onError('Google sign-in was cancelled.');
    else if (err) onError('Google sign-in failed. Please try again.');
  }, [searchParams, onError]);
  return null;
}

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Sign in failed.'); setLoading(false); return; }
      localStorage.setItem('wr_token', data.token);
      window.location.href = '/discover';
    } catch {
      setError('Network error. Please try again.'); setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <Suspense><GoogleErrorReader onError={setError} /></Suspense>
      <div className="auth-card">
        <div className="auth-logo">
          <AegisMark size={36} />
          <span className="auth-logo-text">War Room</span>
        </div>
        <h1 className="auth-title">Sign in</h1>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus />
          </div>
          <div className="auth-field">
            <div className="auth-field-row">
              <label>Password</label>
              <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>
            </div>
            <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="auth-divider">or continue with</div>
        <a href="/api/auth/google" className="btn-oauth">
          <GoogleIcon /> Continue with Google
        </a>
        <p className="auth-foot">No account? <Link href="/register">Create a free account</Link></p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.34-8.16 2.34-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
