import React from 'react';
import { getWeatherCondition } from '../utils/weatherCodes';
import { formatCacheAge } from '../utils/weatherCache';

/**
 * WeatherCard
 *
 * Props:
 *   weather        – response object from /api/weather
 *                    Shape: { location, current, daily }
 *   geoStatus      – 'loading' | 'granted' | 'denied' | 'unavailable' | 'timeout'
 *   geoError       – human-readable string when geolocation fails, else null
 *   isFallback     – true when Bengaluru default coordinates are in use
 *   isCached       – true when currently displaying localStorage-cached data
 *   lastUpdated    – epoch ms of the last successful fetch, or null
 *   weatherLoading – true while the background refresh is in flight
 *   weatherError   – non-null only when there is NO data at all (cache + network both failed)
 */
const WeatherCard = ({
  weather,
  geoStatus,
  geoError,
  isFallback,
  isCached,
  lastUpdated,
  weatherLoading,
  weatherError,
}) => {
  // ── Loading / error states ───────────────────────────────────────────────────

  // Still waiting for the browser to return a GPS position
  if (geoStatus === 'loading') {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-center items-center h-full gap-2">
        <p className="text-gray-500 text-sm font-medium">Detecting your location…</p>
        <p className="text-gray-400 text-xs">Requesting GPS permission</p>
      </div>
    );
  }

  // Geolocation resolved but weather data not yet available
  if (!weather && !weatherError) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-center items-center h-full gap-2">
        <p className="text-gray-500 text-sm font-medium">Loading weather data…</p>
        {isFallback && geoError && (
          <p className="text-amber-500 text-xs text-center px-4">{geoError}</p>
        )}
      </div>
    );
  }

  // No data at all — both cache and network failed
  if (weatherError && !weather) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-center items-center h-full gap-2">
        <p className="text-red-400 text-sm font-medium">Weather unavailable</p>
        <p className="text-gray-400 text-xs text-center px-4">{weatherError}</p>
      </div>
    );
  }

  // ── Safe data extraction ────────────────────────────────────────────────────

  const current = weather?.current ?? {};
  const today   = weather?.daily?.[0] ?? null; // first daily entry = today's forecast

  // Current conditions (real Open-Meteo values)
  const temperature = current.temperature   != null ? Math.round(current.temperature) : null;
  const humidity    = current.humidity      != null ? current.humidity                : null;
  const windSpeed   = current.windSpeed     != null ? current.windSpeed               : null;
  const weatherCode = current.weatherCode;

  // Today's forecast from daily array (safe access — array may be empty or absent)
  const rainProbability = today?.precipitationProbability != null
    ? today.precipitationProbability
    : null;
  const precipitationToday = today?.precipitation != null
    ? today.precipitation
    : null;

  // Weather condition (emoji + label) from WMO code
  const condition = getWeatherCondition(weatherCode);

  // Location label from backend (Open-Meteo snaps coords to nearest grid point)
  const loc = weather?.location ?? null;
  const locationLabel = loc?.latitude != null && loc?.longitude != null
    ? (() => {
        const lat = loc.latitude.toFixed(2);
        const lon = loc.longitude.toFixed(2);
        const tz  = loc.timezone;
        return tz ? `${tz} (${lat}°, ${lon}°)` : `${lat}°, ${lon}°`;
      })()
    : null;

  // Day / date display
  const today_ = new Date();
  const displayDay  = today_.toLocaleDateString('en-US', { weekday: 'long' });
  const displayDate = today_.toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  // Cache age label
  const cacheAgeLabel = formatCacheAge(lastUpdated);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-between h-full">

      {/* ── Header row ── */}
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xs font-semibold text-gray-400 tracking-wide">
            Weather's today
          </h3>
          {/* Fallback badge: shown when using Bengaluru default coordinates */}
          {isFallback && (
            <span
              title={geoError || 'Using default location (Bengaluru)'}
              className="text-[9px] font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full"
            >
              Fallback location
            </span>
          )}
        </div>

        {/* Location label from backend */}
        {locationLabel && (
          <p className="text-[10px] text-gray-400 mb-2 truncate" title={locationLabel}>
            📍 {locationLabel}
          </p>
        )}

        {/* ── Main weather section ── */}
        <div className="flex items-center justify-between mt-1">

          {/* Left: day, date, temperature, rain info */}
          <div>
            <h4 className="text-xl font-bold text-gray-900">{displayDay}</h4>
            <p className="text-xs text-gray-400 font-medium">({displayDate})</p>

            <div className="mt-3">
              <div className="text-3xl font-black text-gray-900 tracking-tight">
                {temperature != null ? `${temperature}°C` : '--'}
              </div>
              {/* Rain probability + today's total precipitation */}
              <p className="text-xs text-gray-400 font-medium mt-1">
                {rainProbability != null
                  ? `${rainProbability}% chance of rain`
                  : 'Rain chance: N/A'}
                {precipitationToday != null && precipitationToday > 0
                  ? ` · ${precipitationToday}mm today`
                  : ''}
              </p>
            </div>
          </div>

          {/* Right: large weather condition emoji + label */}
          <div className="flex flex-col items-center justify-center ml-4">
            <span
              className="text-5xl leading-none"
              role="img"
              aria-label={condition.label}
            >
              {condition.emoji}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 mt-1.5 text-center">
              {condition.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom metrics row ── */}
      <div>
        <div className="grid grid-cols-3 pt-5 border-t border-gray-100 text-xs font-semibold text-gray-600 mt-4">

          {/* Wind speed */}
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{windSpeed != null ? `${windSpeed}Km/h` : '--'}</span>
          </div>

          {/* Humidity */}
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span>{humidity != null ? `${humidity}%` : '--'}</span>
          </div>

          {/* Rain probability — real Open-Meteo daily data, replaces mock pressure */}
          <div className="flex items-center justify-end gap-1.5">
            <svg className="w-4 h-4 text-gray-400 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="8" y1="16" x2="8" y2="21" strokeLinecap="round" />
              <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
              <line x1="16" y1="16" x2="16" y2="21" strokeLinecap="round" />
            </svg>
            <span>{rainProbability != null ? `${rainProbability}%` : '--'}</span>
          </div>
        </div>

        {/* ── Cache / freshness indicator ── */}
        {cacheAgeLabel && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <span
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                isCached
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              {isCached ? `Offline · ${cacheAgeLabel.toLowerCase().replace('updated ', '').replace('last updated ', '')}` : cacheAgeLabel}
            </span>
            {/* Subtle spinning dot while a background refresh is in flight */}
            {weatherLoading && !isCached && (
              <span className="text-[9px] text-gray-400 animate-pulse">Refreshing…</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;
