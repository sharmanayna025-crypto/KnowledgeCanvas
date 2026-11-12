import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs `fn` on mount (and whenever `reload` is called), tracking
 * loading/error state and ignoring results from stale calls.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const run = useRef(0);

  const load = useCallback(async () => {
    const id = ++run.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      if (id === run.current) setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (id === run.current) setState((s) => ({ data: s.data, error, loading: false }));
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  const setData = useCallback(
    (updater) =>
      setState((s) => ({
        ...s,
        data: typeof updater === "function" ? updater(s.data) : updater,
      })),
    []
  );

  return { ...state, reload: load, setData };
}
