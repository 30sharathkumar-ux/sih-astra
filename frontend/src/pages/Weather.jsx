import React, { useState, useEffect, useRef } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { loadWeatherCache, saveWeatherCache, formatCacheAge } from '../utils/weatherCache';
import { getHumanReadableLocation } from '../utils/reverseGeocode';
import { getWeather } from '../services/api';
import { getWeatherCondition } from '../utils/weatherCodes';
import { generateWeatherInsights } from '../utils/weatherDecisionEngine';

const FALLBACK_LAT = 12.9716;
const FALLBACK_LON = 77.5946;

const WeatherPage = () => {
  // ── Weather state ──────────────────────────────────────────────────────────
  const [weather, setWeather] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const hasWeatherRef = useRef(false);
  // Mirror of weatherLocation for reading inside effects without stale closure
  const weatherLocationRef = useRef(null);

  // Geo
  const { coords, status: geoStatus, error: geoError } = useGeolocation();
  const isFallback = geoStatus === 'denied' || geoStatus === 'unavailable' || geoStatus === 'timeout';

  // ── 1. Load cached weather on mount ─────────────────────────────────────────
  useEffect(() => {
    const cached = loadWeatherCache();
    if (cached) {
      setWeather(cached.data);
      const cachedLoc = cached.location || null;
      setWeatherLocation(cachedLoc);
      weatherLocationRef.current = cachedLoc;
      setIsCached(true);
      setLastUpdated(cached.lastUpdated);
      hasWeatherRef.current = true;
    }
  }, []);

  // ── 2. Fetch fresh weather + location once geo resolves ──────────────────
  //
  // Architecture:
  //   • Fires once when geoStatus leaves 'loading' (dep: [geoStatus]).
  //   • hasFetchedRef prevents a second fetch if the effect somehow runs again.
  //   • Weather and geocoding run in parallel; neither failure blocks the other.
  //   • isCached is set to FALSE only when a NETWORK response arrives.
  //     It never goes back to true after that.
  //   • Location is never overwritten with null if a good value already exists.
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (geoStatus === 'loading') return;
    if (hasFetchedRef.current) return; // only fetch once
    hasFetchedRef.current = true;

    const lat = coords?.latitude  ?? FALLBACK_LAT;
    const lon = coords?.longitude ?? FALLBACK_LON;

    console.log('[Weather] geoStatus:', geoStatus);

    const fetchAll = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      try {
        // Both run in parallel; neither can block the other
        const [weatherResult, locationResult] = await Promise.allSettled([
          getWeather(lat, lon),
          getHumanReadableLocation(lat, lon),
        ]);

        console.log('[Weather] weather fetch:', weatherResult.status);
        console.log('[Weather] reverse geocode:', locationResult.status);

        // ── Location (always independent of weather result) ─────────────────
        const freshLoc = locationResult.status === 'fulfilled' ? locationResult.value : null;
        // Never replace a valid cached location with null
        const prevLoc     = weatherLocationRef.current;
        const resolvedLoc = freshLoc || prevLoc;
        // Always update ref so weather-fail cache-save path sees the latest value
        weatherLocationRef.current = resolvedLoc;
        // Update state if the resolved value actually changed
        if (resolvedLoc !== prevLoc) {
          setWeatherLocation(resolvedLoc);
        }
        console.log('[Weather] location source:', freshLoc ? 'gps' : (prevLoc ? 'cache' : 'none'));

        // ── Weather ─────────────────────────────────────────────────────────
        if (weatherResult.status === 'fulfilled') {
          const freshData = weatherResult.value;
          const now = Date.now();

          // Explicitly mark as LIVE (not cached). This is the only place
          // where isCached is set to false — on a confirmed network success.
          setWeather(freshData);
          setIsCached(false);      // ← LIVE data: clear the offline indicator
          setLastUpdated(now);
          saveWeatherCache(freshData, resolvedLoc);
          hasWeatherRef.current = true;
        } else {
          console.error('[Weather] weather fetch failed:', weatherResult.reason?.message);
          // Keep cached weather — do NOT change isCached; it stays true (Offline)
          if (!hasWeatherRef.current) {
            setWeatherError('Weather temporarily unavailable. Please check your connection.');
          }
          // Persist improved location alongside existing cached weather data
          if (freshLoc && hasWeatherRef.current) {
            const existingCache = loadWeatherCache();
            if (existingCache?.data) {
              saveWeatherCache(existingCache.data, resolvedLoc);
            }
          }
        }
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchAll();
  }, [geoStatus]); // eslint-disable-line react-hooks/exhaustive-deps


  // ── 3. Render functions ──────────────────────────────────────────────────────

  if (!weather && !hasWeatherRef.current && weatherLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-500 w-full p-6">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  if (!weather && weatherError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full w-full p-6">
        <div className="bg-white rounded-3xl p-8 shadow-card flex flex-col items-center justify-center text-center">
          <span className="text-4xl mb-3">☁️</span>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{weatherError}</h2>
          <p className="text-gray-500 text-sm">Attempting to reload might fix this issue.</p>
        </div>
      </div>
    );
  }

  if (!weather) return null; // Safety fallback

  // Data Extraction
  const { current, daily } = weather;
  const weatherCode = current?.weatherCode ?? current?.weathercode ?? 0;
  const condition = getWeatherCondition(weatherCode);

  // Build two-line location display from the normalized geocode result.
  // displayName  = most specific line (e.g. "Roopen Agrahara, Bommanahalli")
  // secondaryLine = context line     (e.g. "Bengaluru, Karnataka")
  // Never show raw coordinates, timezone, or empty strings to the farmer.
  const locDisplayName   = weatherLocation?.displayName?.trim()   || weatherLocation?.displayString?.trim() || null;
  const locSecondaryLine = weatherLocation?.secondaryLine?.trim() || null;

  // Headline shown next to the 📍 pin
  const locationHeadline  = locDisplayName || 'Location unavailable';
  // Whether we have a valid resolved location at all
  const hasValidLocation  = !!locDisplayName;

  const cacheAgeLabel = formatCacheAge(lastUpdated);

  // Insights
  const insights = generateWeatherInsights(weather);

  // ── Forecast date handling ────────────────────────────────────────────────
  // todayYMD is computed from the user's local calendar (no UTC shift)
  const todayLocal = new Date();
  const todayYMD = [
    todayLocal.getFullYear(),
    String(todayLocal.getMonth() + 1).padStart(2, '0'),
    String(todayLocal.getDate()).padStart(2, '0'),
  ].join('-');

  // Parse YYYY-MM-DD as a LOCAL calendar date (avoids UTC midnight shift in IST)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  // Filter the raw daily array: keep today and all future dates, drop past dates
  const filteredDaily = (daily ?? []).filter(
    (d) => d.date && d.date >= todayYMD
  );

  // Today's entry is the first item in filteredDaily whose date === todayYMD
  // (may be absent if the API hasn't yet returned today's entry)
  const todayEntry = filteredDaily.find((d) => d.date === todayYMD) ?? null;

  // Safe extraction for Today's Weather section — always from the actual today entry
  const todayMax  = todayEntry?.temperatureMax ?? '--';
  const todayMin  = todayEntry?.temperatureMin ?? '--';
  const rainProb  = todayEntry?.precipitationProbability ?? '--';
  const rainfall  = todayEntry?.precipitation ?? '--';
  const et0       = todayEntry?.et0 ?? '--';

  return (
    <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1400px] w-full mx-auto">
      
      {/* ── SECTION 1: LOCATION HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Weather Dashboard</h1>
          <div className="mt-2 flex flex-col">
            <p className="text-brand-green font-semibold flex items-center gap-1.5 text-lg leading-tight">
              📍 {locationHeadline}
            </p>
            {hasValidLocation && locSecondaryLine && (
              <p className="text-sm text-gray-500 font-medium mt-0.5 pl-6">
                {locSecondaryLine}
              </p>
            )}
            {isFallback && (
              <p className="text-amber-500 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                Using default location
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end">
          {/* Freshness badge — Live when fresh from network, Offline when from cache */}
          {weatherLoading && isCached && (
            <span className="text-sm font-medium text-brand-green animate-pulse mb-1">Refreshing...</span>
          )}
          {isCached ? (
            <div className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-gray-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span className="text-xs font-semibold text-gray-600">
                Offline{cacheAgeLabel ? ` • ${cacheAgeLabel}` : ''}
              </span>
            </div>
          ) : (
            <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-green-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-green"></span>
              <span className="text-xs font-semibold text-brand-green">
                Live{cacheAgeLabel ? ` • ${cacheAgeLabel}` : ' • Updated just now'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 2: CURRENT WEATHER (Hero) */}
          <div className="bg-white rounded-[32px] p-8 shadow-card border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Right Now</h2>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
              <div className="flex items-center gap-6">
                <span className="text-7xl sm:text-8xl drop-shadow-sm">{condition.emoji}</span>
                <div className="flex flex-col">
                  <span className="text-6xl sm:text-7xl font-bold text-gray-800 tracking-tighter">
                    {current?.temperature != null ? Math.round(current.temperature) : '--'}°C
                  </span>
                  <span className="text-xl font-medium text-gray-500 mt-1">{condition.label}</span>
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-4 sm:gap-3 w-full sm:w-auto bg-gray-50/80 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none">
                <div className="flex items-center gap-3 flex-1 sm:flex-none">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg">💧</div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Humidity</span>
                    <span className="text-lg font-bold text-gray-700">{current?.humidity != null ? `${Math.round(current.humidity)}%` : '--'}</span>
                  </div>
                </div>
                <div className="w-[1px] bg-gray-200 sm:h-[1px] sm:w-full"></div>
                <div className="flex items-center gap-3 flex-1 sm:flex-none">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-lg">💨</div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Wind</span>
                    <span className="text-lg font-bold text-gray-700">{current?.windSpeed != null ? `${Math.round(current.windSpeed)} km/h` : '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: 7-DAY FORECAST */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">7-Day Forecast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide -mx-2 px-2">
              {filteredDaily.map((day, idx) => {
                const dayCode = day.weatherCode ?? day.weathercode ?? 0;
                const dayCond = getWeatherCondition(dayCode);

                // Parse the date as a local calendar date (no UTC shift)
                const parsedDate = parseLocalDate(day.date);
                const isToday = day.date === todayYMD;
                const dayName = parsedDate
                  ? parsedDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
                  : 'N/A';

                return (
                  <div key={day.date || idx} className={`snap-start min-w-[110px] flex-shrink-0 flex flex-col items-center justify-between p-4 rounded-2xl ${isToday ? 'bg-brand-surface border-2 border-brand-green/20' : 'bg-gray-50/80 border border-gray-100'} transition-all`}>
                    <span className="text-sm font-bold text-gray-500">{isToday ? 'TODAY' : dayName}</span>
                    <span className="text-4xl my-3 drop-shadow-sm">{dayCond.emoji}</span>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-800">{day.temperatureMax != null ? Math.round(day.temperatureMax) : '--'}°</span>
                      <span className="text-sm font-medium text-gray-400">{day.temperatureMin != null ? Math.round(day.temperatureMin) : '--'}°</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full w-full justify-center">
                      <span className="text-xs">💧</span>
                      <span className="text-[11px] font-bold">{day.precipitationProbability ?? 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECTION 3: TODAY'S WEATHER METRICS */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Today's Summary</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
                <span className="text-xl mb-2 block">🌡️</span>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">High / Low</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{todayMax}° / {todayMin}°</p>
              </div>
              
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50">
                <span className="text-xl mb-2 block">☔</span>
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wide">Rain Chance</p>
                <p className="text-lg font-bold text-blue-900 mt-0.5">{rainProb}%</p>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50">
                <span className="text-xl mb-2 block">🌧️</span>
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wide">Rainfall</p>
                <p className="text-lg font-bold text-blue-900 mt-0.5">{rainfall} mm</p>
              </div>

              <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-50">
                <span className="text-xl mb-2 block">☀️</span>
                <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wide">ET₀</p>
                <p className="text-lg font-bold text-orange-900 mt-0.5">{et0} mm</p>
                <p className="text-[9px] text-orange-600/70 font-medium leading-tight mt-1">Reference water loss</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: TODAY'S ADVICE */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span>🌾</span> Today's Advice
            </h2>
            <div className="flex flex-col gap-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 bg-brand-surface/50 rounded-2xl p-3.5 border border-brand-green/20">
                  <span className="text-xl shrink-0 leading-none mt-0.5">{insight.icon}</span>
                  <p className="text-sm font-medium text-gray-700 leading-snug">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: FARMER INTERPRETATION */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Guide</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-lg shrink-0">☔</span>
                <div>
                  <p className="text-xs font-bold text-gray-700">Rain Chance</p>
                  <p className="text-xs text-gray-500 mt-0.5">Probability of rain today.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg shrink-0">🌧️</span>
                <div>
                  <p className="text-xs font-bold text-gray-700">Rainfall</p>
                  <p className="text-xs text-gray-500 mt-0.5">Expected rainfall amount.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg shrink-0">☀️</span>
                <div>
                  <p className="text-xs font-bold text-gray-700">ET₀</p>
                  <p className="text-xs text-gray-500 mt-0.5">Reference water loss from weather conditions.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg shrink-0">💨</span>
                <div>
                  <p className="text-xs font-bold text-gray-700">Wind</p>
                  <p className="text-xs text-gray-500 mt-0.5">Useful when planning spraying.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
