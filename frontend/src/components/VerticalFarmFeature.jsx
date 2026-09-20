import React from 'react';

const VerticalFarmFeature = () => {
  return (
    <div className="bg-[#143427] rounded-3xl p-6 text-white shadow-card flex flex-col justify-between h-full">
      <div className="w-full bg-[#183d2d] rounded-2xl p-4 relative overflow-hidden flex items-center justify-between mb-4">
        <div className="w-2/3">
          <svg className="w-full h-32" fill="none" viewBox="0 0 160 120">
            <line stroke="#CBD5E1" strokeWidth="2.5" x1="20" x2="20" y1="10" y2="115"></line>
            <line stroke="#CBD5E1" strokeWidth="2.5" x1="120" x2="120" y1="10" y2="115"></line>
            
            <rect fill="#94A3B8" height="6" rx="1" width="104" x="18" y="20"></rect>
            <g transform="translate(25, 6)">
              <circle cx="10" cy="10" fill="#84CC16" r="6"></circle>
              <circle cx="30" cy="10" fill="#84CC16" r="6"></circle>
              <circle cx="50" cy="10" fill="#84CC16" r="6"></circle>
              <circle cx="70" cy="10" fill="#84CC16" r="6"></circle>
            </g>
            
            <rect fill="#94A3B8" height="6" rx="1" width="104" x="18" y="52"></rect>
            <g transform="translate(25, 38)">
              <circle cx="10" cy="10" fill="#4ADE80" r="6"></circle>
              <circle cx="30" cy="10" fill="#4ADE80" r="6"></circle>
              <circle cx="50" cy="10" fill="#4ADE80" r="6"></circle>
              <circle cx="70" cy="10" fill="#4ADE80" r="6"></circle>
            </g>
            
            <rect fill="#94A3B8" height="6" rx="1" width="104" x="18" y="84"></rect>
            <g transform="translate(25, 70)">
              <circle cx="10" cy="10" fill="#22C55E" r="6"></circle>
              <circle cx="30" cy="10" fill="#22C55E" r="6"></circle>
              <circle cx="50" cy="10" fill="#22C55E" r="6"></circle>
              <circle cx="70" cy="10" fill="#22C55E" r="6"></circle>
            </g>
            
            <rect fill="#38BDF8" height="16" opacity="0.4" rx="2" width="90" x="25" y="98"></rect>
            <rect fill="none" height="16" rx="2" stroke="#BAE6FD" strokeWidth="1.5" width="90" x="25" y="98"></rect>
            <rect fill="#334155" height="8" width="10" x="30" y="103"></rect>
          </svg>
        </div>
        
        <div className="w-1/3 flex justify-center">
          <svg className="w-20 h-32" viewBox="0 0 60 120">
            <circle cx="30" cy="18" fill="#FDBA74" r="8"></circle>
            <path d="M22 14 C22 9, 38 9, 38 14 Z" fill="#0F172A"></path>
            <path d="M25 20 C25 26, 35 26, 35 20 Z" fill="#0F172A"></path>
            <path d="M20 28 L40 28 L44 68 L16 68 Z" fill="#FFFFFF"></path>
            <rect fill="#0F172A" height="38" width="8" x="20" y="68"></rect>
            <rect fill="#0F172A" height="38" width="8" x="32" y="68"></rect>
            <ellipse cx="23" cy="106" fill="#020617" rx="5" ry="3"></ellipse>
            <ellipse cx="37" cy="106" fill="#020617" rx="5" ry="3"></ellipse>
            <rect fill="#38BDF8" height="12" rx="1" width="8" x="42" y="42"></rect>
          </svg>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white leading-tight">
            Vertical Harvest<br/>Farms
          </h3>
          <button aria-label="Play recording" className="w-11 h-11 rounded-full bg-brand-lime flex items-center justify-center text-brand-dark shadow-lg hover:scale-105 active:scale-95 transition-transform" type="button">
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"></path>
            </svg>
          </button>
        </div>
        
        <div>
          <div className="relative w-full py-1">
            <div className="w-full bg-white dark:bg-gray-800/20 h-1 rounded-full overflow-hidden">
              <div className="bg-brand-lime h-1 rounded-full" style={{ width: '52%' }}></div>
            </div>
            <div className="absolute left-[52%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-lime border-2 border-brand-dark shadow"></div>
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-white/50 mt-1">
            <span>18.90</span>
            <span>36.00</span>
          </div>
        </div>
      </div>
      
      <p className="text-[11px] leading-relaxed text-white/70 font-normal mt-4">
        Vertical Farming is a novel method of growing crops by artificially stacking plants vertically above each other either in skyscrapers or by using the third dimension of space.
      </p>
    </div>
  );
};

export default VerticalFarmFeature;
