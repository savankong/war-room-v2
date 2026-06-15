'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('wr_token', token);
      router.replace('/discover');
    } else {
      router.replace('/login?error=auth_failed');
    }
  }, [router]);

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Archivo, sans-serif', color: '#5A6B82', fontSize: 14,
    }}>
      Signing you in…
    </div>
  );
}
