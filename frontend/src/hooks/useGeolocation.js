import { useState, useEffect } from 'react';

/**
 * useGeolocation
 *
 * Requests the browser's Geolocation API exactly once (on mount).
 * Does NOT poll or re-request on re-renders.
 *
 * Returns:
 *   coords   – { latitude, longitude } when permission is granted, otherwise null
 *   status   – 'loading' | 'granted' | 'denied' | 'unavailable' | 'timeout'
 *   error    – human-readable error string when status is not 'granted', otherwise null
 */
const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Guard: some environments (e.g. HTTP non-localhost) block geolocation
    if (!navigator?.geolocation) {
      setStatus('unavailable');
      setError('Geolocation is not supported by this browser.');
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        // ── TEMP DIAGNOSTIC (remove before commit) ─────────────────────────
        console.group('[GPS] Position acquired');
        console.log('accuracy (m):', position.coords.accuracy);
        console.log('latitude:    ', position.coords.latitude);
        console.log('longitude:   ', position.coords.longitude);
        console.groupEnd();
        // ── END TEMP DIAGNOSTIC ────────────────────────────────────────────
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('granted');
        setError(null);
      },
      (err) => {
        if (cancelled) return;
        // err.code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (err.code === 1) {
          setStatus('denied');
          setError('Location permission denied. Showing weather for default location (Bengaluru).');
        } else if (err.code === 3) {
          setStatus('timeout');
          setError('Location request timed out. Showing weather for default location (Bengaluru).');
        } else {
          setStatus('unavailable');
          setError('Location unavailable. Showing weather for default location (Bengaluru).');
        }
        setCoords(null);
      },
      {
        // High accuracy forces the GPS chip rather than Wi-Fi/cell triangulation.
        // This produces a precise enough position for BigDataCloud to return a
        // neighbourhood name instead of just the city.
        enableHighAccuracy: true,
        timeout: 12000,    // GPS chip may need extra time for satellite lock
        maximumAge: 0,     // always get a fresh position — no cached coarse fixes
      }
    );

    return () => {
      // Prevent state updates if Dashboard unmounts before geolocation responds
      cancelled = true;
    };
  }, []); // Empty deps: run once on mount only

  return { coords, status, error };
};

export default useGeolocation;
