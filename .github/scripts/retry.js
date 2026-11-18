const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRetryable = (e) => !e.status || e.status >= 500 || e.status === 429;

/**
 * Runs `fn` up to `attempts` times with exponential backoff.
 * Only 5xx, 429 and network errors are retried; other errors are thrown immediately.
 * `onError(e)` may return true to stop retrying and treat the call as done.
 */
async function withRetry(core, name, fn, { attempts = 5, baseDelayMs = 5000, onError } = {}) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (onError && (await onError(e))) return;
      if (!isRetryable(e) || i === attempts) throw e;
      const delay = baseDelayMs * 2 ** (i - 1);
      core.warning(`${name} attempt ${i}/${attempts} failed (${e.status}): ${e.message}. Retrying in ${delay / 1000}s`);
      await sleep(delay);
    }
  }
}

module.exports = { withRetry };
