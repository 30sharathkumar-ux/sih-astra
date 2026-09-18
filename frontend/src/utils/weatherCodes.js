/**
 * weatherCodes.js
 *
 * Maps Open-Meteo WMO weather interpretation codes to farmer-friendly
 * condition text and a representative emoji.
 *
 * Reference: https://open-meteo.com/en/docs#weathervariables
 * (WMO Weather interpretation codes, Table)
 */

/**
 * @typedef {{ label: string, emoji: string }} WeatherCondition
 */

/**
 * Resolve a WMO code to a { label, emoji } condition object.
 * Returns a sensible fallback for unknown or null codes.
 *
 * @param {number|null|undefined} code
 * @returns {WeatherCondition}
 */
export const getWeatherCondition = (code) => {
  if (code == null) return { label: 'Unknown', emoji: '🌡️' };

  // Clear sky
  if (code === 0)  return { label: 'Clear Sky',      emoji: '☀️'  };

  // Mostly clear / partly cloudy / overcast
  if (code === 1)  return { label: 'Mostly Clear',   emoji: '🌤️'  };
  if (code === 2)  return { label: 'Partly Cloudy',  emoji: '⛅'  };
  if (code === 3)  return { label: 'Overcast',       emoji: '☁️'  };

  // Fog & depositing rime fog
  if (code === 45 || code === 48) return { label: 'Foggy', emoji: '🌫️' };

  // Drizzle
  if (code >= 51 && code <= 55)   return { label: 'Drizzle',         emoji: '🌦️' };
  if (code === 56 || code === 57) return { label: 'Freezing Drizzle', emoji: '🌧️' };

  // Rain
  if (code >= 61 && code <= 65)   return { label: 'Rain',          emoji: '🌧️' };
  if (code === 66 || code === 67) return { label: 'Freezing Rain',  emoji: '🌧️' };

  // Snow
  if (code >= 71 && code <= 77)   return { label: 'Snowfall',      emoji: '❄️'  };

  // Rain showers
  if (code >= 80 && code <= 82)   return { label: 'Rain Showers',  emoji: '🌦️' };
  if (code === 85 || code === 86) return { label: 'Snow Showers',   emoji: '🌨️' };

  // Thunderstorm
  if (code >= 95 && code <= 99)   return { label: 'Thunderstorm',  emoji: '⛈️'  };

  return { label: 'Unknown', emoji: '🌡️' };
};
