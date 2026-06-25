import { useCallback, useEffect, useRef, useState } from "react";

export interface ResourceState<T> {
	data: T | null;
	error: string | null;
	/** First load, nothing to show yet. */
	isLoading: boolean;
	/** Refetching while previous data is still on screen. */
	isRevalidating: boolean;
	refetch: () => void;
}

export interface UseResourceOptions {
	/** Poll interval (ms) while `shouldPoll` is true. Omit to disable polling. */
	intervalMs?: number;
	/** When true (with `intervalMs`), refetch on the interval — e.g. while rows are pending sync. */
	shouldPoll?: boolean;
}

/**
 * Generic stale-while-revalidate fetch for a JSON GET endpoint. Mirrors the pattern in
 * `visualize-laws-app` (`components/results/ResultsPanel.tsx`):
 *  - cancels in-flight requests and ignores out-of-order responses (request-id guard),
 *  - keeps the last successful `data` while refetching (no flash / empty-on-refresh),
 *  - exposes distinct `isLoading` (first load) vs `isRevalidating` (background refresh).
 *
 * Pass `url = null` to stay idle (e.g. before an id is known). Optionally poll while a
 * condition holds (e.g. an optimistic row hasn't been reconciled by the poller yet).
 */
export function useResource<T>(url: string | null, opts: UseResourceOptions = {}): ResourceState<T> {
	const { intervalMs, shouldPoll } = opts;
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isFetching, setIsFetching] = useState<boolean>(!!url);
	const reqId = useRef(0);
	const [tick, setTick] = useState(0);

	const refetch = useCallback(() => setTick((t) => t + 1), []);

	useEffect(() => {
		if (!url) {
			setData(null);
			setError(null);
			setIsFetching(false);
			return;
		}
		const id = ++reqId.current;
		const ctrl = new AbortController();
		setIsFetching(true);
		setError(null);
		fetch(url, { signal: ctrl.signal, cache: "no-store" })
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.json() as Promise<T>;
			})
			.then((json) => {
				if (id !== reqId.current) return;
				setData(json);
				setIsFetching(false);
			})
			.catch((err) => {
				if (ctrl.signal.aborted || id !== reqId.current) return;
				setError(err instanceof Error ? err.message : String(err));
				setIsFetching(false);
			});
		return () => ctrl.abort();
	}, [url, tick]);

	// Background polling while the caller says there's still something to reconcile.
	useEffect(() => {
		if (!url || !intervalMs || !shouldPoll) return;
		const h = setInterval(() => setTick((t) => t + 1), intervalMs);
		return () => clearInterval(h);
	}, [url, intervalMs, shouldPoll]);

	return {
		data,
		error,
		isLoading: isFetching && data === null,
		isRevalidating: isFetching && data !== null,
		refetch,
	};
}
