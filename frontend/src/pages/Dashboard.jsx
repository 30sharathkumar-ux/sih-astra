import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import WeatherCard from '../components/WeatherCard';
import PlantGrowthCard from '../components/PlantGrowthCard';
import GreenhouseVisual from '../components/GreenhouseVisual';
import ProductionSummary from '../components/ProductionSummary';
import VerticalFarmFeature from '../components/VerticalFarmFeature';
import DiseaseAlert from '../components/DiseaseAlert';
import useGeolocation from '../hooks/useGeolocation';
import { loadWeatherCache, saveWeatherCache } from '../utils/weatherCache';
import { getHumanReadableLocation } from '../utils/reverseGeocode';
import {
  getFarmData,
  getSensorReadings,
  getWeather,
  getDiseaseDetections,
  getProductionData,
} from '../services/api';

// Fallback coordinates used only when geolocation is denied or unavailable.
const FALLBACK_LAT = 12.9716;
const FALLBACK_LON = 77.5946;

const Dashboard = () => {
  const [farmData, setFarmData]     = useState(null);
  const [sensors, setSensors]       = useState(null);
  const [diseases, setDiseases]     = useState([]);
  const [production, setProduction] = useState([]);
  const [loading, setLoading]       = useState(true);

  // ── Weather state ──────────────────────────────────────────────────────────
  const [weather, setWeather]           = useState(null);
  const [weatherLocation, setWeatherLocation] = useState(null);
  const [isCached, setIsCached]         = useState(false);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  /**
   * Ref to know whether we already have weather data (cached or fresh)
   * at the time the background fetch either succeeds or fails.
   * Avoids stale-closure issues inside async callbacks.
   */
  const hasWeatherRef = useRef(false);

  // Request geolocation once on mount; does not re-fire on re-renders.
  const { coords, status: geoStatus, error: geoError } = useGeolocation();

  // isFallback is true when we are using Bengaluru defaults instead of the
  // farmer's real location (geolocation denied or unavailable).
  const isFallback =
    geoStatus === 'denied' ||
    geoStatus === 'unavailable' ||
    geoStatus === 'timeout';

  // ── STEP A: Load cached weather immediately on mount ───────────────────────
  // This runs before geolocation resolves so the user sees something instantly.
  useEffect(() => {
    const cached = loadWeatherCache();
    if (cached) {
      setWeather(cached.data);
      setWeatherLocation(cached.location || null);
      setIsCached(true);
      setLastUpdated(cached.lastUpdated);
      hasWeatherRef.current = true;
    }
  }, []); // runs once on mount only

  // ── STEP B/C/D/E: Fetch fresh weather once geolocation resolves ────────────
  useEffect(() => {
    // Still waiting for browser geolocation — do nothing yet
    if (geoStatus === 'loading') return;

    const lat = coords?.latitude  ?? FALLBACK_LAT;
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

        // STEP C: fresh fetch succeeded
        setWeather(freshData);
        setWeatherLocation(freshLoc);
        setIsCached(false);
        setLastUpdated(now);
        saveWeatherCache(freshData, freshLoc);   // update localStorage cache
        hasWeatherRef.current = true;
      } catch (err) {
        console.error('[Dashboard] Weather fetch failed:', err);

        if (hasWeatherRef.current) {
          // STEP D: we have cached data — keep displaying it silently.
          // isCached stays true; lastUpdated stays as the old timestamp.
          // No big error banner needed — the "Last updated X ago" label is enough.
        } else {
          // STEP E: no cached data at all — show an explicit error state.
          setWeatherError('Could not load weather data. Check your connection.');
        }
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchFreshWeather();
    // Deps: only geoStatus. coords is stable once geoStatus leaves 'loading'.
  }, [geoStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Non-weather data: load immediately, independent of geolocation ─────────
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [farmRes, sensorRes, diseaseRes, prodRes] = await Promise.all([
          getFarmData(),
          getSensorReadings(),
          getDiseaseDetections(),
          getProductionData(),
        ]);
        setFarmData(farmRes);
        setSensors(sensorRes);
        setDiseases(diseaseRes);
        setProduction(prodRes);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1700px] w-full">
      <Header farmData={farmData} />

      {/* Disease Alerts Row */}
      {diseases.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {diseases.map(disease => (
            <DiseaseAlert key={disease.id} data={disease} />
          ))}
        </div>
      )}

      {/* TopGridSection */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-12 lg:col-span-4 flex flex-col">
          <WeatherCard
            weather={weather}
            weatherLocation={weatherLocation}
            geoStatus={geoStatus}
            geoError={geoError}
            isFallback={isFallback}
            isCached={isCached}
            lastUpdated={lastUpdated}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
          />
        </div>
        <div className="md:col-span-12 lg:col-span-4 flex flex-col">
          <PlantGrowthCard />
        </div>
        <div className="md:col-span-12 lg:col-span-4 flex flex-col">
          <GreenhouseVisual />
        </div>
      </section>

      {/* BottomGridSection */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <ProductionSummary data={production} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <VerticalFarmFeature />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
