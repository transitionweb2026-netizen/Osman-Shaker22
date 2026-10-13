"use client";

import { useCallback, useEffect, useState } from "react";

type AsyncState<T> = { data: T | null; error: string | null; version: number };

/**
 * Loads data for a screen. `load` should be memoized (useCallback); it runs
 * again when it changes or when `reload()` is called. `version` identifies
 * the load that produced `data` (useful as a React key for editors that copy
 * it into their own state).
 */
export function useAsync<T>(load: () => Promise<T>) {
  const [request, setRequest] = useState(0);
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, version: 0 });

  useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setState({ data, error: null, version: request }),
      (error: unknown) =>
        alive && setState((current) => ({ ...current, error: error instanceof Error ? error.message : String(error) })),
    );
    return () => {
      alive = false;
    };
  }, [load, request]);

  const reload = useCallback(() => setRequest((n) => n + 1), []);
  /** Optimistic local update (e.g. a new order before the server confirms it). */
  const mutate = useCallback((data: T) => setState((current) => ({ ...current, data })), []);

  return { ...state, reload, mutate };
}
