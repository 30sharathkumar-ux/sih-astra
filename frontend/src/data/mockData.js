export const farmData = {
  name: "Stanton Green House",
  location: "Europe",
  status: "Optimal",
  lastUpdated: new Date().toISOString(),
  issues: 0,
};

export const sensorReadings = {
  temperature: 29,
  roomTemp: 25,
  humidity: 86,
  windSpeed: 0,
  pressure: 1007,
  sunlight: "9.35 hours",
  botBattery: 85,
  soilMoisture: 42,
};

export const diseaseDetections = [
  {
    id: 1,
    disease: "Onion Blight",
    confidence: 92,
    crop: "Onion",
    zone: "Zone 3",
    severity: "High",
    detectedAt: "2023-04-10T10:30:00Z",
    recommendation: "Apply fungicide immediately.",
  }
];

export const weatherData = {
  day: "Monday",
  date: "10th Apr, 2023",
  currentTemp: 29,
  forecast: "Sunny with scattered clouds",
  rainProbability: 10
};

export const alerts = [
  { id: 1, type: "disease", message: "Possible Onion Blight detected in Zone 3", read: false },
  { id: 2, type: "sensor", message: "Soil moisture low in Zone 1", read: false },
  { id: 3, type: "bot", message: "Harvest bot #4 battery at 15%", read: false }
];

export const productionData = [
  { month: "Jan", current: 1400, lastYear: 1200 },
  { month: "Feb", current: 2200, lastYear: 2000 },
  { month: "Mar", current: 3000, lastYear: 2800 },
  { month: "Apr", current: 3800, lastYear: 3400 },
  { month: "May", current: 4800, lastYear: 4400 },
  { month: "Jun", current: 6000, lastYear: 5200 },
  { month: "Jul", current: 5000, lastYear: 5800 },
  { month: "Aug", current: 7200, lastYear: 7000 },
  { month: "Sep", current: 6400, lastYear: 6200 },
  { month: "Oct", current: 4800, lastYear: 4200 },
  { month: "Nov", current: 3800, lastYear: 4000 },
  { month: "Dec", current: 5200, lastYear: 5600 },
];
