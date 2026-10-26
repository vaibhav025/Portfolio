"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny external store for the few values that the scroll timeline writes and
 * React reads (only on discrete changes, never per frame).
 */
type State = {
  workIndex: number;
  scene: string;
  sound: boolean;
};

let state: State = { workIndex: 0, scene: "intro", sound: false };
const subs = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof State;
      if (state[key] !== patch[key]) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => subs.delete(f);
  },
};

export function useStore<T>(pick: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => pick(store.get()),
    () => pick(state),
  );
}
