export const DEFAULT_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Retrieve data from localStorage with TTL validation.
 * @param {string} key 
 * @param {number} [ttlMs=DEFAULT_CACHE_TTL] 
 * @returns {any | null}
 */
export function getCache(key, ttlMs = DEFAULT_CACHE_TTL) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > ttlMs) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`Error reading cache for key "${key}":`, err);
    return null;
  }
}

/**
 * Save data to localStorage with a timestamp.
 * @param {string} key 
 * @param {any} data 
 */
export function setCache(key, data) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (err) {
    console.warn(`Error saving cache for key "${key}":`, err);
  }
}

/**
 * Remove an item from localStorage cache.
 * @param {string} key 
 */
export function removeCache(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Error removing cache for key "${key}":`, err);
  }
}
