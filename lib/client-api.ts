'use client';

/**
 * Browser-side API helper.
 *
 * The v2 auth scheme is a JWT in localStorage sent as a bearer token; every
 * screen was re-implementing the same read-token-and-attach-header dance, and
 * the ones that forgot the 401 branch silently rendered an empty page instead
 * of sending the customer to log in.
 */

export function authToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('wr_token') ?? '';
  } catch {
    // Private browsing and blocked site data both throw here.
    return '';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = authToken();

  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401) {
    // The token is gone or expired. Clearing it stops every later request
    // retrying with the same dead credential.
    try {
      localStorage.removeItem('wr_token');
    } catch {
      /* ignore */
    }
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }

  const text = await response.text();
  const body = text ? (JSON.parse(text) as T & { error?: string }) : ({} as T & { error?: string });

  if (!response.ok) {
    throw new ApiError(body.error ?? `Request failed (${response.status})`, response.status);
  }

  return body as T;
}

export function formatUsd(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** "in 12 days" / "closed" — the thing a customer actually reads on a deadline. */
export function daysUntil(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'closed';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `${days} days`;
}
