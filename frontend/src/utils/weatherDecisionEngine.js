/**
 * weatherDecisionEngine.js
 * 
 * Transforms raw weather data into farmer-friendly insights based strictly
 * on weather conditions, without making unjustified crop/soil-specific claims.
 */

const THRESHOLDS = {
  RAIN_PROBABILITY: 60, // %
  RAIN_AMOUNT: 5,       // mm
  WIND_SPEED: 20,       // km/h
  TEMP_MAX: 35,         // °C
  HUMIDITY_MAX: 40,     // %
  ET0_HIGH: 5,          // mm
};

/**
 * Generates an array of weather-based insights.
 * @param {object} weather - The full /api/weather response object
 * @returns {Array<{ type: string, icon: string, text: string, priority: number }>}
 */
export const generateWeatherInsights = (weather) => {
  if (!weather || !weather.current || !weather.daily || !weather.daily.length) {
    return [];
  }

  const current = weather.current;
  const today = weather.daily[0];
  const insights = [];

  // Safe extraction
  const rainProb = today.precipitationProbability ?? 0;
  const rainAmount = today.precipitation ?? 0;
  const windSpeed = current.windSpeed ?? 0;
  const tempMax = today.temperatureMax ?? null;
  const humidity = current.humidity ?? null;
  const et0 = today.et0 ?? 0;

  let rainRuleTriggered = false;

  // 1. Rain rule
  if (rainProb > THRESHOLDS.RAIN_PROBABILITY || rainAmount > THRESHOLDS.RAIN_AMOUNT) {
    insights.push({
      type: 'rain',
      icon: '🌧️',
      text: 'Rain is likely today — check soil before watering.',
      priority: 1,
    });
    rainRuleTriggered = true;
  }

  // 2. Wind rule
  if (windSpeed > THRESHOLDS.WIND_SPEED) {
    insights.push({
      type: 'wind',
      icon: '💨',
      text: 'Wind is currently strong — spraying may be less suitable.',
      priority: 2,
    });
  }

  // 3. Heat + dry rule
  if (tempMax !== null && humidity !== null) {
    if (tempMax > THRESHOLDS.TEMP_MAX && humidity < THRESHOLDS.HUMIDITY_MAX) {
      insights.push({
        type: 'heat',
        icon: '☀️',
        text: 'Hot and dry conditions — monitor crops for heat stress.',
        priority: 1,
      });
    }
  }

  // 4. High ET0 rule
  if (et0 > THRESHOLDS.ET0_HIGH && !rainRuleTriggered) {
    insights.push({
      type: 'evaporation',
      icon: '💧',
      text: 'Higher reference water loss today — soil may dry faster.',
      priority: 3,
    });
  }

  // 5. Default rule if no insights generated
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      icon: '🌿',
      text: 'No major weather concerns detected today.',
      priority: 4,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
};
