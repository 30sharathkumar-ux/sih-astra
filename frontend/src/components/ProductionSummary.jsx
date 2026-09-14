import React from 'react';

const ProductionSummary = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Max value for scaling
  const maxVal = 7000;
  
  return (
    <div className="bg-white rounded-3xl p-6 shadow-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Summary of production</h2>
          <div className="flex items-center gap-2">
            <button aria-label="Filter" className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100" type="button">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <button aria-label="Expand view" className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100" type="button">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 mb-6 gap-2">
          <span className="font-medium text-gray-400">Comparing with last year</span>
          <div className="flex items-center gap-4 font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-lime"></span>
              <span className="text-[11px]">Current Year Production</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark"></span>
              <span className="text-[11px]">Last Year Production</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-64 mt-2">
        <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 font-semibold pointer-events-none pb-6">
          {[5000, 4000, 3000, 2000, 1000, 0].map((val) => (
            <div key={val} className="flex items-center gap-3">
              <span className="w-6 text-right">{val}</span>
              <div className={`flex-1 ${val === 0 ? 'border-b border-gray-200' : 'border-b border-gray-100'}`}></div>
            </div>
          ))}
        </div>

        {/* Active Tooltip Tag for June (mocked static location) */}
        <div className="absolute left-[47.5%] top-1 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
          <div className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
            onion 1.6(t)
          </div>
          <div className="h-16 w-0 border-r border-dashed border-black/80 my-0.5"></div>
          <div className="bg-black text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow -mt-1">
            onion 1.0(t)
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 top-2 pl-10 pr-2 flex items-end justify-between">
          {data.map((item) => (
            <div key={item.month} className="flex flex-col items-center flex-1">
              <div className="w-5 flex flex-col items-center">
                <div 
                  className="w-full bg-brand-lime rounded-t-sm transition-all" 
                  style={{ height: `${(item.current / maxVal) * 100}px` }}
                ></div>
                <div 
                  className="w-full bg-brand-dark rounded-b-sm transition-all" 
                  style={{ height: `${(item.lastYear / maxVal) * 100}px` }}
                ></div>
              </div>
              <span className={`text-[10px] font-bold mt-2 ${item.month === 'Jun' ? 'text-gray-900' : 'text-gray-500'}`}>
                {item.month.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionSummary;
