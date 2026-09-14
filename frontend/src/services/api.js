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

export const getWeather = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return weatherData;
};

export const getAlerts = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return alerts;
};

export const getProductionData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return productionData;
};
