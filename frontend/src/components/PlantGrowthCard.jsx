import React from 'react';

const PlantGrowthCard = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500">Plant growth activity</h3>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100" type="button">
          Weekly
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </button>
      </div>

      <div className="relative w-full h-36 mt-2">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-gray-100 w-full h-0"></div>
          <div className="border-b border-gray-100 w-full h-0"></div>
          <div className="border-b border-gray-100 w-full h-0"></div>
          <div className="border-b border-gray-100 w-full h-0"></div>
        </div>
        
        <div className="absolute inset-0 flex justify-between pointer-events-none px-6">
          <div className="border-r border-gray-100 h-full"></div>
          <div className="border-r border-gray-100 h-full"></div>
        </div>

        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 120">
          <defs>
            <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.2"></stop>
              <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0.0"></stop>
            </linearGradient>
          </defs>
          <path d="M 20 95 C 70 85, 110 50, 160 45 C 210 40, 240 25, 280 20" fill="none" stroke="#32A89C" strokeLinecap="round" strokeWidth="2.5"></path>
        </svg>

        <div className="absolute left-2 bottom-3 transform -translate-x-1/2">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5E7EB] shadow-sm flex items-center justify-center p-1">
            <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" opacity="0.1"></path>
              <path d="M19 13h-6V7h-2v6H5v2h6v6h2v-6h6z" opacity="0"></path>
              <ellipse cx="12" cy="14" fill="#8D5B4C" rx="6" ry="3"></ellipse>
              <circle cx="12" cy="11" fill="#48BB78" r="2.5"></circle>
            </svg>
          </div>
        </div>

        <div className="absolute left-1/2 top-4 transform -translate-x-1/2 flex flex-col items-center">
          <div className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
            18 cm
          </div>
          <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-lime shadow-md flex items-center justify-center p-1">
            <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 19V5M12 5l-4 4M12 5l4 4"></path>
            </svg>
          </div>
        </div>

        <div className="absolute right-4 top-1">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5E7EB] shadow-sm flex items-center justify-center p-1">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] font-bold text-gray-800 tracking-tight pt-3 border-t border-gray-100 mt-2">
        <span>Seed Phase <span className="text-gray-400 font-normal">(W1)</span></span>
        <span>Final Growth <span className="text-gray-400 font-normal">(W3)</span></span>
        <span>Vegetation <span className="text-gray-400 font-normal">(W2)</span></span>
      </div>
    </div>
  );
};

export default PlantGrowthCard;
