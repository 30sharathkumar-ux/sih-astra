import { 
  farmData, 
  sensorReadings, 
  diseaseDetections, 
  weatherData, 
  alerts,
  productionData
} from '../data/mockData';

// Use environment variable for backend URL, default to localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Clean API abstraction layer for FastAPI backend.
 * Currently using mock data until endpoints are integrated.
 * 
 * Example real implementation:
 * export const getSensorReadings = async () => {
 *   const response = await fetch(`${API_BASE_URL}/api/sensors/latest`);
 *   return response.json();
 * }
 */

export const getFarmData = async () => {
  // Simulate network delay
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
  const response = await fetch(`${API_BASE_URL}/api/weather?latitude=${latitude}&longitude=${longitude}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  return await response.json();
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

  const response = await fetch(`${API_BASE_URL}/api/disease/predict`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type manually — the browser sets it with the correct
    // multipart/form-data boundary when using FormData.
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Disease API error: ${response.status}`);
  }

  return response.json();
};
