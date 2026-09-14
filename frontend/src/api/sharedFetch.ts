// Short-TTL shared promises (module scope, in-memory only — never localStorage).
//
// Purpose: several consumers ask for the same payload when a unit page opens —
// the access guard validates the unit and the page itself loads it. Without
// sharing, the unit GET / workspace GET fires twice (plus React StrictMode's
// double-invoke in dev). This module deduplicates them: the first caller starts
// the request, everyone else within the TTL window awaits the same promise.
//
// Failed requests evict their entry immediately so a retry isn't stuck on a
// rejected promise for the rest of the TTL.

const TTL_MS = 10_000;

interface CacheEntry {
  promise: Promise<any>;
  createdAt: number;
}

const inflight = new Map<string, CacheEntry>();
// Bumped by invalidateShared() so post-mutation refetches start a fresh request
// while unrelated duplicate callers still share the current one.
const versions = new Map<string, number>();

/** Run `run()` once per key per TTL; concurrent/duplicate callers share the promise. */
export function sharedPromise<T>(key: string, run: () => Promise<T>): Promise<T> {
  const version = versions.get(key) || 0;
  const cacheKey = `${key}@${version}`;
  const now = Date.now();
  const existing = inflight.get(cacheKey);
  if (existing && now - existing.createdAt < TTL_MS) {
    return existing.promise as Promise<T>;
  }
  const promise = run().catch((error) => {
    // Evict on failure so the next caller retries instead of re-rejecting.
    if (inflight.get(cacheKey)?.promise === promise) inflight.delete(cacheKey);
    throw error;
  });
  inflight.set(cacheKey, { promise, createdAt: now });
  return promise;
}

/**
 * Drop the cached promise for `key`: the next sharedPromise(key, …) call starts
 * a fresh request. Used after mutations so the page never renders stale rows.
 */
export function invalidateShared(key: string): void {
  const version = versions.get(key) || 0;
  inflight.delete(`${key}@${version}`);
  versions.set(key, version + 1);
}
