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
        enableHighAccuracy: false, // faster, lower power — sufficient for weather
        timeout: 8000,
        maximumAge: 300000, // accept a cached position up to 5 minutes old
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
