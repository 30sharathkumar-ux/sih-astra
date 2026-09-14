import React from 'react';
import { AlertTriangle, MapPin, Activity, ShieldAlert } from 'lucide-react';

const DiseaseAlert = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-card-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -translate-y-10 translate-x-10"></div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-red-900 leading-tight">
              AI Detection: {data.disease}
            </h3>
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              {data.confidence}% Confidence
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <p className="text-red-700/70 text-xs font-semibold mb-0.5">Crop</p>
              <p className="font-semibold text-red-900">{data.crop}</p>
            </div>
            <div>
              <p className="text-red-700/70 text-xs font-semibold mb-0.5">Location</p>
              <p className="font-semibold text-red-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {data.zone}
              </p>
            </div>
            <div>
              <p className="text-red-700/70 text-xs font-semibold mb-0.5">Severity</p>
              <p className="font-semibold text-red-900 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> {data.severity}
              </p>
            </div>
            <div>
              <p className="text-red-700/70 text-xs font-semibold mb-0.5">Detected</p>
              <p className="font-semibold text-red-900">
                {new Date(data.detectedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-red-200/60">
            <p className="text-sm text-red-800 font-medium">
              <span className="font-bold text-red-900">Recommendation:</span> {data.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseAlert;
