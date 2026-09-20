import { 
  farmData, 
  sensorReadings, 
  diseaseDetections, 
  weatherData, 
  alerts,
  productionData
} from '../data/mockData';

// ---------------------------------------------------------------------------
// Open-Meteo base URL — public, free, no API key required.
// Weather data is fetched directly from the browser so no backend is needed
// for this feature in the deployed Vercel app.
// ---------------------------------------------------------------------------
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// ---------------------------------------------------------------------------
// FastAPI backend URL — only used for disease detection.
// If VITE_API_BASE_URL is not set the backend is treated as "not configured"
// and a user-friendly message is shown instead of a crash.
// ---------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const IS_DEV = import.meta.env.DEV;

// ---------------------------------------------------------------------------
// Shared fetch wrapper (used only for the FastAPI endpoints)
// ---------------------------------------------------------------------------
async function apiFetch(url, options = {}) {
  if (IS_DEV) console.debug(`[API] →`, options.method || 'GET', url);

  let response;
  try {
    response = await fetch(url, options);
  } catch (networkErr) {
    if (IS_DEV) console.error('[API] Network error:', networkErr);
    throw new Error(
      'Could not reach the server. ' +
      (IS_DEV
        ? `Make sure the backend is running at ${API_BASE_URL}.`
        : 'Please try again in a moment.')
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail || `HTTP ${response.status}`;
    if (IS_DEV) console.error(`[API] ← ${response.status}`, detail);
    throw new Error(detail);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Mock-data endpoints (Farm / Sensors / Production / Alerts)
// These use local fixtures until real backend endpoints exist.
// ---------------------------------------------------------------------------

export const getFarmData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return farmData;
};

export const getSensorReadings = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return sensorReadings;
};

export const getDiseaseDetections = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return diseaseDetections;
};

export const getAlerts = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return alerts;
};

export const getProductionData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return productionData;
};

// ---------------------------------------------------------------------------
// Weather — fetched directly from Open-Meteo (browser → Open-Meteo).
// No backend, no API key, no CORS issues, free forever.
//
// The response is normalised to the same shape the backend used to return:
//   { location, current, daily }
// so WeatherCard, weatherCache, and weatherDecisionEngine are unchanged.
// ---------------------------------------------------------------------------

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{ location, current, daily }>}
 */
export const getWeather = async (latitude = 12.9716, longitude = 77.5946) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'et0_fao_evapotranspiration',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const url = `${OPEN_METEO_URL}?${params}`;
  if (IS_DEV) console.debug('[API] → GET', url);

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (IS_DEV) console.error('[API] Open-Meteo network error:', err);
    throw new Error('Could not reach the weather service. Check your internet connection.');
  }

  if (!res.ok) {
    throw new Error(`Weather service returned ${res.status}. Please try again.`);
  }

  const data = await res.json();

  // ── Normalise to the shape the rest of the app already consumes ──────────
  const raw = data.current ?? {};
  const daily = data.daily ?? {};

  const safeGet = (field, i) => {
    const arr = daily[field];
    return Array.isArray(arr) && i < arr.length ? arr[i] : null;
  };

  const dailyForecast = (daily.time ?? []).map((date, i) => ({
    date,
    weatherCode:              safeGet('weather_code', i),
    temperatureMax:           safeGet('temperature_2m_max', i),
    temperatureMin:           safeGet('temperature_2m_min', i),
    precipitation:            safeGet('precipitation_sum', i),
    precipitationProbability: safeGet('precipitation_probability_max', i),
    et0:                      safeGet('et0_fao_evapotranspiration', i),
  }));

  return {
    location: {
      latitude:  data.latitude,
      longitude: data.longitude,
      timezone:  data.timezone,
    },
    current: {
      temperature:        raw.temperature_2m,
      apparentTemperature: raw.apparent_temperature,
      humidity:           raw.relative_humidity_2m,
      precipitation:      raw.precipitation,
      weatherCode:        raw.weather_code,
      windSpeed:          raw.wind_speed_10m,
    },
    daily: dailyForecast,
  };
};

// ---------------------------------------------------------------------------
// Disease Detection — calls the FastAPI backend.
//
// In the Vercel production deployment the backend is typically NOT running.
// We surface a labelled error (BACKEND_UNAVAILABLE) so DiseaseDetection.jsx
// can show a friendly "available in the local demo" message instead of a
// generic crash. No fake results are returned.
// ---------------------------------------------------------------------------

/** Sentinel error code recognised by DiseaseDetection.jsx */
export const BACKEND_UNAVAILABLE_CODE = 'BACKEND_UNAVAILABLE';

/**
 * Send a plant image to the FastAPI disease detection endpoint.
 *
 * @param {File} file - An image File object from a file input or drag-and-drop.
 * @returns {Promise<{ success: boolean, detections: Array<{ class: string, confidence: number }>, model_classes: string[] }>}
 * @throws {Error} with `.code === BACKEND_UNAVAILABLE_CODE` when the backend
 *   is not configured, or a regular Error on other failures.
 */
export const predictPlantDisease = async (file) => {
  // If no backend URL is configured, fail early with a labelled error.
  if (!API_BASE_URL) {
    const err = new Error(
      'AI analysis is available in the local demonstration environment. ' +
      'The deployed app does not include the AI backend.'
    );
    err.code = BACKEND_UNAVAILABLE_CODE;
    throw err;
  }

  const formData = new FormData();
  formData.append('file', file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/disease/predict`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    // Backend is configured but unreachable (e.g. service is down).
    const err = new Error(
      'AI analysis is available in the local demonstration environment. ' +
      'The deployed app does not include the AI backend.'
    );
    err.code = BACKEND_UNAVAILABLE_CODE;
    throw err;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Disease API error: ${response.status}`);
  }

  return response.json();
};


