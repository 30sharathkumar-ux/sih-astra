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

  // Geo
  const { coords, status: geoStatus, error: geoError } = useGeolocation();
  const isFallback = geoStatus === 'denied' || geoStatus === 'unavailable' || geoStatus === 'timeout';

  // ── 1. Load cached weather on mount ─────────────────────────────────────────
  useEffect(() => {
    const cached = loadWeatherCache();
    if (cached) {
      setWeather(cached.data);
      setWeatherLocation(cached.location || null);
      setIsCached(true);
      setLastUpdated(cached.lastUpdated);
      hasWeatherRef.current = true;
    }
  }, []);

  // ── 2. Fetch fresh weather in background once geo resolves ──────────────────
  useEffect(() => {
    if (geoStatus === 'loading') return;

    const lat = coords?.latitude ?? FALLBACK_LAT;
    const lon = coords?.longitude ?? FALLBACK_LON;

    const fetchFreshWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      try {
        const results = await Promise.allSettled([
          getWeather(lat, lon),
          getHumanReadableLocation(lat, lon)
        ]);

        if (results[0].status === 'rejected') {
          throw results[0].reason;
        }

        const freshData = results[0].value;
        const freshLoc = results[1].status === 'fulfilled' ? results[1].value : null;
        const now = Date.now();

        setWeather(freshData);
        setWeatherLocation(freshLoc);
        setIsCached(false);
        setLastUpdated(now);
        saveWeatherCache(freshData, freshLoc);
        hasWeatherRef.current = true;
      } catch (err) {
        console.error('[WeatherPage] Fetch failed:', err);
        if (!hasWeatherRef.current) {
          setWeatherError('Weather temporarily unavailable. Please check your connection.');
        }
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchFreshWeather();
  }, [geoStatus, coords]);

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

  const loc = weather?.location ?? null;
  const rawCoordsLabel = loc?.latitude != null && loc?.longitude != null
    ? (loc.timezone ? `${loc.timezone} (${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°)` : `${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`)
    : 'Location unavailable';
    
  const locationDisplay = weatherLocation?.displayString || rawCoordsLabel;
  const cacheAgeLabel = formatCacheAge(lastUpdated);

  // Insights
  const insights = generateWeatherInsights(weather);

  // Safe extraction for Today's Weather section
  const todayMax = daily?.[0]?.temperatureMax ?? '--';
  const todayMin = daily?.[0]?.temperatureMin ?? '--';
  const rainProb = daily?.[0]?.precipitationProbability ?? '--';
  const rainfall = daily?.[0]?.precipitation ?? '--';
  const et0 = daily?.[0]?.et0 ?? '--';

  return (
    <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1400px] w-full mx-auto">
      
      {/* ── SECTION 1: LOCATION HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Weather Dashboard</h1>
          <div className="mt-2 flex flex-col">
            <p className="text-brand-green font-medium flex items-center gap-1.5 text-lg">
              📍 {locationDisplay}
            </p>
            {isFallback && (
              <p className="text-amber-500 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                Using default location
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end">
          {weatherLoading && isCached && (
            <span className="text-sm font-medium text-brand-green animate-pulse mb-1">Refreshing...</span>
          )}
          {isCached ? (
            <div className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-gray-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span className="text-xs font-semibold text-gray-600">
                Offline • {cacheAgeLabel}
              </span>
            </div>
          ) : (
            <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-green-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-green"></span>
              <span className="text-xs font-semibold text-brand-green">
                {cacheAgeLabel || 'Updated just now'}
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
                  <span className="text-xl font-medium text-gray-500 mt-1">{condition.text}</span>
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
              {daily?.map((day, idx) => {
                const dayCode = day.weatherCode ?? day.weathercode ?? 0;
                const dayCond = getWeatherCondition(dayCode);
                const isToday = idx === 0;
                
                let dayName = 'Err';
                if (day.time) {
                  const date = new Date(day.time);
                  dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                }

                return (
                  <div key={idx} className={`snap-start min-w-[110px] flex-shrink-0 flex flex-col items-center justify-between p-4 rounded-2xl ${isToday ? 'bg-brand-surface border-2 border-brand-green/20' : 'bg-gray-50/80 border border-gray-100'} transition-all`}>
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
