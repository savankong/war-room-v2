'use client';

import { useState } from 'react';

/**
 * Reset some state when a value it depends on changes.
 *
 * The obvious way to write this is an effect:
 *
 *     useEffect(() => setPage(1), [tab, search]);
 *
 * which works but renders twice for every change: React commits the stale
 * page, paints it, runs the effect, then renders again with page 1. On a long
 * table that flash of the wrong page is visible, and `react-hooks/
 * set-state-in-effect` flags it.
 *
 * Setting state *during* render is the supported fix for this specific case.
 * React discards the in-progress render and immediately retries with the new
 * state, before touching the DOM, so nothing stale is ever painted. The rule
 * for it is that the component must be able to finish rendering — so `reset`
 * only ever calls setState on this component, and the guard means it happens
 * once per change rather than on every render.
 *
 * `key` must be a primitive, because it is compared with `!==`. For several
 * dependencies, join them:
 *
 *     useResetOn(`${tab}|${search}`, () => setPage(1));
 */
export function useResetOn(key: string | number | boolean, reset: () => void): void {
  const [previous, setPrevious] = useState(key);

  if (previous !== key) {
    setPrevious(key);
    reset();
  }
}
