import React, { useState, useEffect } from 'react';

const Settings = () => {
  // States for all settings
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Alert settings
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('alertSettings');
    return saved ? JSON.parse(saved) : {
      plantDisease: true,
      weather: true,
      farmMonitoring: true,
      criticalOnly: false,
    };
  });
  
  // Sensitivity setting
  const [sensitivity, setSensitivity] = useState(localStorage.getItem('notificationSensitivity') || 'Medium');
  
  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);

  // Apply theme class to document element when theme state changes or component mounts
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleAlertToggle = (key) => {
    setAlerts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('alertSettings', JSON.stringify(alerts));
    localStorage.setItem('notificationSensitivity', sensitivity);
    
    // Explicitly apply theme on save as well
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto w-full bg-brand-surface dark:bg-gray-900 transition-colors">
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your dashboard preferences and system alerts.</p>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-6">
        
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Dashboard Theme</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose between light and dark mode.</p>
            </div>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  theme === 'light' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Notifications & Alerts</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Plant Disease Detection</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts when potential diseases are identified.</p>
              </div>
              <button 
                onClick={() => handleAlertToggle('plantDisease')}
                className={`w-12 h-6 rounded-full relative transition-colors ${alerts.plantDisease ? 'bg-brand-lime' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${alerts.plantDisease ? 'translate-x-6.5 left-0.5' : 'translate-x-0.5'}`} style={{ transform: alerts.plantDisease ? 'translateX(26px)' : 'translateX(2px)' }} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Weather Alerts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notifications for extreme weather conditions.</p>
              </div>
              <button 
                onClick={() => handleAlertToggle('weather')}
                className={`w-12 h-6 rounded-full relative transition-colors ${alerts.weather ? 'bg-brand-lime' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${alerts.weather ? 'translate-x-6.5 left-0.5' : 'translate-x-0.5'}`} style={{ transform: alerts.weather ? 'translateX(26px)' : 'translateX(2px)' }} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Farm Monitoring</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Updates on sensors, soil moisture, and equipment.</p>
              </div>
              <button 
                onClick={() => handleAlertToggle('farmMonitoring')}
                className={`w-12 h-6 rounded-full relative transition-colors ${alerts.farmMonitoring ? 'bg-brand-lime' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${alerts.farmMonitoring ? 'translate-x-6.5 left-0.5' : 'translate-x-0.5'}`} style={{ transform: alerts.farmMonitoring ? 'translateX(26px)' : 'translateX(2px)' }} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700 mt-2">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Critical Alerts Only</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mute all standard notifications and only show emergencies.</p>
              </div>
              <button 
                onClick={() => handleAlertToggle('criticalOnly')}
                className={`w-12 h-6 rounded-full relative transition-colors ${alerts.criticalOnly ? 'bg-brand-lime' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${alerts.criticalOnly ? 'translate-x-6.5 left-0.5' : 'translate-x-0.5'}`} style={{ transform: alerts.criticalOnly ? 'translateX(26px)' : 'translateX(2px)' }} />
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Notification Sensitivity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select how easily alerts should be triggered by the AI system.</p>
            
            <select 
              value={sensitivity} 
              onChange={(e) => setSensitivity(e.target.value)}
              className="w-full md:w-64 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-lime focus:border-brand-lime outline-none"
            >
              <option value="Low">Low (Fewer alerts)</option>
              <option value="Medium">Medium (Balanced)</option>
              <option value="High">High (More sensitive)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          {showSuccess && (
            <span className="text-brand-dark dark:text-brand-lime font-medium bg-brand-limeBg dark:bg-brand-dark px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Settings saved successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-8 py-3 bg-brand-dark dark:bg-brand-lime text-white dark:text-brand-darker font-bold rounded-xl hover:opacity-90 transition-opacity focus:ring-4 focus:ring-brand-lime/20"
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
