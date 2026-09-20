import React from 'react';
import { getWeatherCondition } from '../utils/weatherCodes';
import { formatCacheAge } from '../utils/weatherCache';
import { generateWeatherInsights } from '../utils/weatherDecisionEngine';

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
  weatherLocation,
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
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-card flex flex-col justify-center items-center h-full gap-2">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Detecting your location…</p>
        <p className="text-gray-400 text-xs">Requesting GPS permission</p>
      </div>
    );
  }

  // Geolocation resolved but weather data not yet available
  if (!weather && !weatherError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-card flex flex-col justify-center items-center h-full gap-2">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading weather data…</p>
        {isFallback && geoError && (
          <p className="text-amber-500 text-xs text-center px-4">{geoError}</p>
        )}
      </div>
    );
  }

  // No data at all — both cache and network failed
  if (weatherError && !weather) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-card flex flex-col justify-center items-center h-full gap-2">
        <p className="text-red-400 text-sm font-medium">Weather unavailable</p>
        <p className="text-gray-400 text-xs text-center px-4">{weatherError}</p>
      </div>
    );
  }

  // ── Safe data extraction ────────────────────────────────────────────────────

  const current = weather?.current ?? {};
  const daily   = weather?.daily ?? [];
  const today   = daily[0] ?? null; 

  // Current conditions
  const temperature = current.temperature   != null ? Math.round(current.temperature) : null;
  const humidity    = current.humidity      != null ? current.humidity                : null;
  const windSpeed   = current.windSpeed     != null ? current.windSpeed               : null;
  const weatherCode = current.weatherCode;

  // Today's summary
  const tempHigh = today?.temperatureMax != null ? Math.round(today.temperatureMax) : null;
  const tempLow  = today?.temperatureMin != null ? Math.round(today.temperatureMin) : null;
  const rainChance = today?.precipitationProbability != null ? today.precipitationProbability : null;
  const expectedRain = today?.precipitation != null ? today.precipitation : null;
  const et0 = today?.et0 != null ? today.et0 : null;

  // Weather condition (emoji + label) from WMO code for current
  const condition = getWeatherCondition(weatherCode);

  // Build two-line location from the normalized geocode result.
  // Fall through to 'Location unavailable' rather than showing raw coordinates.
  const locDisplayName   = weatherLocation?.displayName?.trim()   || weatherLocation?.displayString?.trim() || null;
  const locSecondaryLine = weatherLocation?.secondaryLine?.trim() || null;
  const locationHeadline = locDisplayName || 'Location unavailable';
  const hasValidLocation = !!locDisplayName;

  // Day / date display
  const today_ = new Date();
  const displayDay  = today_.toLocaleDateString('en-US', { weekday: 'long' });
  const displayDate = today_.toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  // 7-Day Forecast (next 6 days)
  const upcomingDays = daily.slice(1, 7);

  // Cache age label
  const cacheAgeLabel = formatCacheAge(lastUpdated);

  // Generate actionable insights based strictly on weather
  const insights = generateWeatherInsights(weather);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-card flex flex-col justify-between h-full">

      {/* ── Header row ── */}
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xs font-semibold text-gray-400 tracking-wide">
            Current Weather
          </h3>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate mb-0" title={locationHeadline}>
            📍 {locationHeadline}
          </p>
          {hasValidLocation && locSecondaryLine && (
            <p className="text-[10px] text-gray-400 font-medium truncate pl-4 mb-0.5">
              {locSecondaryLine}
            </p>
          )}
          {isFallback && (
            <p className="text-[10px] text-amber-500 mb-2 truncate">
              Using default location
            </p>
          )}
          {!isFallback && <div className="mb-2"></div>}
        </div>

        {/* ── Section 1: Right Now ── */}
        <div className="flex items-center justify-between mt-1">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{displayDay}</h4>
            <p className="text-xs text-gray-400 font-medium">({displayDate})</p>

            <div className="mt-3">
              <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {temperature != null ? `${temperature}°C` : '--'}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center ml-4">
            <span
              className="text-5xl leading-none"
              role="img"
              aria-label={condition.label}
            >
              {condition.emoji}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mt-1.5 text-center">
              {condition.label}
            </span>
          </div>
        </div>

        {/* Current Wind & Humidity */}
        <div className="flex gap-4 mt-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Wind: {windSpeed != null ? `${windSpeed} Km/h` : '--'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span>Humidity: {humidity != null ? `${humidity}%` : '--'}</span>
          </div>
        </div>
      </div>

      <hr className="my-4 border-gray-100 dark:border-gray-700" />

      {/* ── Section 2: Today's Summary ── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 tracking-wide mb-3">
          Today's Summary
        </h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          {/* High / Low */}
          <div>
            <p className="text-[10px] text-gray-400 font-medium">High / Low</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {tempHigh != null && tempLow != null ? `${tempHigh}° / ${tempLow}°` : '--'}
            </p>
          </div>
          
          {/* Rain */}
          <div>
            <p className="text-[10px] text-gray-400 font-medium">Rainfall (Chance)</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {expectedRain != null ? `${expectedRain} mm` : '--'}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                ({rainChance != null ? `${rainChance}%` : '--'})
              </span>
            </p>
          </div>

          {/* ET0 */}
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              ET₀ <span className="text-[9px] font-normal text-gray-400">· Reference water loss</span>
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {et0 != null ? `${et0} mm` : '--'}
            </p>
          </div>
        </div>
      </div>

      <hr className="my-4 border-gray-100 dark:border-gray-700" />

      {/* ── Section 3: Today's Advice ── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 tracking-wide mb-3 flex items-center gap-1.5">
          <span>🌾</span> Today's Advice
        </h3>
        <div className="flex flex-col gap-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2 bg-gray-50/80 rounded-xl p-2.5 border border-gray-50/50">
              <span className="text-sm leading-none mt-0.5">{insight.icon}</span>
              <p className="text-[11px] font-medium text-gray-700 dark:text-gray-200 leading-snug">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-4 border-gray-100 dark:border-gray-700" />

      {/* ── Section 4: Upcoming 7 Days (Scrollable) ── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 tracking-wide mb-3">
          Upcoming
        </h3>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {upcomingDays.map((dayData, i) => {
            // Parse YYYY-MM-DD as local calendar date (not UTC) to avoid day-shift in IST/similar
            let shortDay = '--';
            if (dayData.date) {
              const [yr, mo, dy] = dayData.date.split('-').map(Number);
              if (yr && mo && dy) {
                shortDay = new Date(yr, mo - 1, dy).toLocaleDateString('en-US', { weekday: 'short' });
              }
            }
            const dayCondition = getWeatherCondition(dayData.weatherCode);
            const dayHigh = dayData.temperatureMax != null ? Math.round(dayData.temperatureMax) : '--';
            const dayLow = dayData.temperatureMin != null ? Math.round(dayData.temperatureMin) : '--';
            const dayRainProb = dayData.precipitationProbability != null ? dayData.precipitationProbability : '--';

            return (
              <div key={i} className="flex flex-col items-center min-w-[64px] bg-gray-50 rounded-2xl py-2 px-1 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{shortDay}</span>
                <span className="text-xl my-1" title={dayCondition.label}>{dayCondition.emoji}</span>
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-100">{dayHigh}°</span>
                <span className="text-[10px] font-medium text-gray-400">{dayLow}°</span>
                <div className="flex items-center gap-0.5 mt-1 text-[9px] font-medium text-blue-500">
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  {dayRainProb !== '--' ? `${dayRainProb}%` : '--'}
                </div>
              </div>
            );
          })}
          {upcomingDays.length === 0 && (
            <p className="text-xs text-gray-400 italic">Forecast unavailable</p>
          )}
        </div>
      </div>

      {/* ── Cache / freshness indicator ── */}
      {cacheAgeLabel && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span
            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
              isCached
                ? 'bg-gray-100 text-gray-500 dark:text-gray-400'
                : 'bg-green-50 text-green-600'
            }`}
          >
            {isCached ? `Offline · ${cacheAgeLabel.toLowerCase().replace('updated ', '').replace('last updated ', '')}` : cacheAgeLabel}
          </span>
          {weatherLoading && !isCached && (
            <span className="text-[9px] text-gray-400 animate-pulse">Refreshing…</span>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;

