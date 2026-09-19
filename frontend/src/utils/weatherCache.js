/**
 * weatherCache.js
 *
 * Provides localStorage helpers for offline-first weather caching.
 * Key: 'astra_weather_cache'
 * Stored shape: { data: <API response>, location: <LocationObj>, lastUpdated: <ms timestamp> }
 */

const CACHE_KEY = 'astra_weather_cache';

/**
 * Persist a successful weather API response to localStorage.
 * @param {object} data - The full /api/weather response object.
 * @param {object} location - The human-readable location object (optional).
 */
export const saveWeatherCache = (data, location = null) => {
  try {
    const entry = { data, location, lastUpdated: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (e) {
    // localStorage may be unavailable (private browsing, storage quota exceeded)
    console.warn('[WeatherCache] Could not save cache:', e);
  }
};

/**
 * Load a previously cached weather response from localStorage.
 * @returns {{ data: object, location: object|null, lastUpdated: number } | null}
 */
export const loadWeatherCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry?.data || !entry?.lastUpdated) return null;
    return entry;
  } catch (e) {
    return null;
  }
};

/**
 * Remove the cached weather entry from localStorage.
 */
export const clearWeatherCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (_) {}
};

/**
 * Convert a lastUpdated ms timestamp into farmer-friendly text.
 *
 * Examples:
 *   < 2 min   → "Updated just now"
 *   < 60 min  → "Updated 25 min ago"
 *   < 24 hr   → "Last updated 3h ago"
 *   1 day     → "Last updated yesterday"
 *   > 1 day   → "Last updated 2 days ago"
 *
 * @param {number|null} lastUpdated - epoch ms from Date.now()
 * @returns {string|null}
 */
export const formatCacheAge = (lastUpdated) => {
  if (!lastUpdated) return null;

  const diffMs   = Date.now() - lastUpdated;
  const diffMin  = Math.floor(diffMs / 60_000);
  const diffHr   = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 2)   return 'Updated just now';
  if (diffMin < 60)  return `Updated ${diffMin} min ago`;
  if (diffHr < 24)   return `Last updated ${diffHr}h ago`;
  if (diffDays === 1) return 'Last updated yesterday';
  return `Last updated ${diffDays} days ago`;
};
