"use client";

/**
 * useClock — a ticking Date hook, SSR-safe.
 * ─────────────────────────────────────────────────────────────
 *  • Built on `useSyncExternalStore` (React 19) — no setState-in-effect.
 *  • Returns `null` on the server (no hydration mismatch).
 *
 *  TWO CRITICAL INVARIANTS for useSyncExternalStore (violating either
 *  causes "Maximum update depth exceeded"):
 *
 *  1. getSnapshot MUST return a cached reference — NOT `new Date()`.
 *     A fresh object every call makes React think the store changed
 *     on every read → infinite re-render loop.
 *
 *  2. subscribe MUST have a stable identity across renders. If it is
 *     recreated every render, React re-subscribes each render: the
 *     cleanup runs (listener removed → if last, timer stopped + snapshot
 *     reset to null), then the new subscribe runs (snapshot set to new
 *     Date) → snapshot reference flips null→Date→null→Date → infinite
 *     loop.
 *
 *  Fix: `useCallback` keeps `subscribe` stable; `store.time` is never
 *  reset to null in cleanup (the last known value is kept so the
 *  snapshot reference can't flip on re-subscribe).
 */

import { useCallback, useSyncExternalStore } from "react";

type TimeStore = {
  time: Date | null;
  intervalMs: number;
  timerId: ReturnType<typeof setInterval> | null;
  listeners: Set<() => void>;
};

// Module-level singleton store — one timer serves all subscribers.
const store: TimeStore = {
  time: null,
  intervalMs: 1000,
  timerId: null,
  listeners: new Set(),
};

function tick() {
  store.time = new Date();
  store.listeners.forEach((l) => l());
}

// Stable module-level snapshot getters — never recreated.
function getClientSnapshot(): Date | null {
  return store.time;
}
function getServerSnapshot(): null {
  return null;
}

export function useClock(intervalMs = 1000): Date | null {
  // Stable subscribe — inline function (satisfies react-hooks/use-memo),
  // only changes identity when intervalMs changes, so React does not
  // re-subscribe on every render.
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      store.listeners.add(onChange);

      // Start (or restart) the timer only on first subscriber, or if the
      // requested interval differs from the currently-running one.
      const needsStart =
        store.timerId === null || intervalMs !== store.intervalMs;
      if (needsStart) {
        if (store.timerId !== null) {
          clearInterval(store.timerId);
        }
        // Initialize the snapshot ONLY if it has never been set — never
        // overwrite a cached value here (would flip the reference).
        if (store.time === null) {
          store.time = new Date();
        }
        store.intervalMs = intervalMs;
        store.timerId = setInterval(tick, intervalMs);
      }

      return () => {
        store.listeners.delete(onChange);
        // Stop the timer when the last subscriber leaves, but KEEP
        // store.time — resetting it to null would flip the snapshot
        // reference on the next subscribe and re-trigger renders.
        if (store.listeners.size === 0 && store.timerId !== null) {
          clearInterval(store.timerId);
          store.timerId = null;
        }
      };
    },
    [intervalMs],
  );
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export default useClock;
