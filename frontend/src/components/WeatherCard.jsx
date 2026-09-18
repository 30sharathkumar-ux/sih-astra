import React from 'react';

const WeatherCard = ({ weather, sensors }) => {
  if (!weather) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-center items-center h-full">
        <p className="text-gray-400">Loading weather data...</p>
      </div>
    );
  }

  const isNewFormat = weather.current !== undefined;

  // Real weather values from Open-Meteo via FastAPI backend
  const currentTemp = isNewFormat
    ? (weather.current.temperature != null ? Math.round(weather.current.temperature) : '--')
    : (weather.currentTemp != null ? weather.currentTemp : '--');

  const windSpeed = isNewFormat
    ? (weather.current.windSpeed != null ? weather.current.windSpeed : '--')
    : (sensors?.windSpeed != null ? sensors.windSpeed : '--');

  const humidity = isNewFormat
    ? (weather.current.humidity != null ? weather.current.humidity : '--')
    : (sensors?.humidity != null ? sensors.humidity : '--');

  // NOTE: pressure and sunlight are NOT returned by Open-Meteo in the current
  // backend response. These still come from sensor/mock data. When unavailable,
  // display '--' rather than a fake value.
  const pressure = sensors?.pressure != null ? sensors.pressure : '--';

  let displayDay = weather.day || 'Monday';
  let displayDate = weather.date || 'N/A';

  if (isNewFormat) {
    const today = new Date();
    displayDay = today.toLocaleDateString('en-US', { weekday: 'long' });
    displayDate = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xs font-semibold text-gray-400 tracking-wide">Weather's today</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-900">{displayDay}</h4>
            <p className="text-xs text-gray-400 font-medium">({displayDate})</p>
            <div className="mt-4">
              <div className="text-3xl font-black text-gray-900 tracking-tight">
                {currentTemp !== '--' ? `${currentTemp}°C` : '--'}
              </div>
              {/* NOTE: sunlight is a sensor/mock value, not from Open-Meteo */}
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {sensors?.sunlight != null ? sensors.sunlight : 'N/A'}
              </p>
            </div>
          </div>

          {/* Radial Gauge Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="#112f23" r="40" stroke="#112f23" strokeWidth="12"></circle>
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#B7F143" strokeDasharray="251.2" strokeDashoffset="130" strokeLinecap="round" strokeWidth="5"></circle>
              <circle cx="83" cy="28" fill="#ffffff" r="3"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {/* NOTE: roomTemp is a sensor/mock value, not from Open-Meteo */}
              <span className="text-white text-base font-bold">
                {sensors?.roomTemp != null ? `${sensors.roomTemp}°C` : '--'}
              </span>
              <span className="text-white/70 text-[9px] font-medium">Room temp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Environmental metrics */}
      <div className="grid grid-cols-3 pt-5 border-t border-gray-100 text-xs font-semibold text-gray-600 mt-4">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span>{windSpeed}Km/h</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
          <span>{humidity}%</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <svg className="w-4 h-4 text-gray-400 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span>{pressure}hPa</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
