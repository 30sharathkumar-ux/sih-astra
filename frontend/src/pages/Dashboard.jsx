import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import WeatherCard from '../components/WeatherCard';
import PlantGrowthCard from '../components/PlantGrowthCard';
import GreenhouseVisual from '../components/GreenhouseVisual';
import ProductionSummary from '../components/ProductionSummary';
import VerticalFarmFeature from '../components/VerticalFarmFeature';
import DiseaseAlert from '../components/DiseaseAlert';
import useGeolocation from '../hooks/useGeolocation';
import { 
  getFarmData, 
  getSensorReadings, 
  getWeather, 
  getDiseaseDetections, 
  getProductionData 
} from '../services/api';

// Fallback coordinates used only when geolocation is denied or unavailable.
const FALLBACK_LAT = 12.9716;
const FALLBACK_LON = 77.5946;

const Dashboard = () => {
  const [farmData, setFarmData] = useState(null);
  const [sensors, setSensors] = useState(null);
  const [weather, setWeather] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  // Request geolocation once on mount; does not re-fire on re-renders.
  const { coords, status: geoStatus, error: geoError } = useGeolocation();

  // isFallback is true when we are using Bengaluru defaults instead of the
  // farmer's real location (geolocation denied or unavailable).
  const isFallback = geoStatus === 'denied' || geoStatus === 'unavailable' || geoStatus === 'timeout';

  // ── Non-weather data: load immediately, independent of geolocation ──────────
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

  // ── Weather data: fetch once geolocation resolves (granted or fallback) ─────
  useEffect(() => {
    // Still waiting for the browser to respond
    if (geoStatus === 'loading') return;

    const lat = coords?.latitude ?? FALLBACK_LAT;
    const lon = coords?.longitude ?? FALLBACK_LON;

    const fetchWeather = async () => {
      try {
        setWeatherError(null);
        const weatherRes = await getWeather(lat, lon);
        setWeather(weatherRes);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setWeatherError('Could not load weather data.');
      }
    };

    fetchWeather();
    // Re-run only when geoStatus changes (i.e., exactly once after geolocation resolves).
    // coords is stable once geoStatus leaves 'loading', so this is safe.
  }, [geoStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading dashboard...</div>;
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
            sensors={sensors}
            geoStatus={geoStatus}
            geoError={geoError}
            isFallback={isFallback}
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
