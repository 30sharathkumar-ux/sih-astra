import { 
  farmData, 
  sensorReadings, 
  diseaseDetections, 
  weatherData, 
  alerts,
  productionData
} from '../data/mockData';

// ---------------------------------------------------------------------------
// Backend base URL
//
// Set VITE_API_BASE_URL in:
//   • Local dev  → frontend/.env.local   (value: http://127.0.0.1:8000)
//   • Vercel     → Project Settings → Environment Variables
//                  (value: https://<your-render-service>.onrender.com)
//
// The fallback is intentionally 127.0.0.1 (not localhost) to avoid the
// IPv6 ::1 resolution issue on some systems.
// ---------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const IS_DEV = import.meta.env.DEV;

if (IS_DEV) {
  console.info(`[API] Using backend: ${API_BASE_URL}`);
}

/**
 * Shared fetch wrapper with consistent error handling and dev-mode logging.
 * @param {string} url  Full request URL
 * @param {RequestInit} [options]
 */
async function apiFetch(url, options = {}) {
  if (IS_DEV) console.debug(`[API] →`, options.method || 'GET', url);

  let response;
  try {
    response = await fetch(url, options);
  } catch (networkErr) {
    // Network-level failure (backend unreachable, no internet, etc.)
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

/**
 * Clean API abstraction layer for FastAPI backend.
 * Mock data is used for non-weather, non-disease endpoints until those
 * backend routes are implemented.
 */

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

export const getWeather = async (latitude = 12.9716, longitude = 77.5946) => {
  // Coordinates are provided by the useGeolocation hook in Dashboard.
  // The default values (Bengaluru) are only used as a last-resort fallback
  // when geolocation is denied or unavailable — not as a permanent location.
  return apiFetch(
    `${API_BASE_URL}/api/weather?latitude=${latitude}&longitude=${longitude}`
  );
};

export const getAlerts = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return alerts;
};

export const getProductionData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return productionData;
};

/**
 * Send a plant image to the FastAPI disease detection endpoint.
 *
 * @param {File} file - An image File object from a file input or drag-and-drop.
 * @returns {Promise<{ success: boolean, detections: Array<{ class: string, confidence: number }>, model_classes: string[] }>}
 * @throws {Error} if the request fails or the server returns a non-OK status.
 */
export const predictPlantDisease = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch(`${API_BASE_URL}/api/disease/predict`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type manually — the browser sets it with the correct
    // multipart/form-data boundary when using FormData.
  });
};

