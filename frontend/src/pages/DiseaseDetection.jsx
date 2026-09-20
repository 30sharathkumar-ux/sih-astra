import React, { useState, useRef } from 'react';
import { predictPlantDisease } from '../services/api';
import { UploadCloud, Image as ImageIcon, Camera, AlertCircle, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Please select an image under 10MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropEvent = { target: { files: e.dataTransfer.files } };
      handleFileChange(dropEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictPlantDisease(selectedFile);
      
      if (!response || !response.success) {
        throw new Error('Analysis failed.');
      }

      setResult(response);
    } catch (err) {
      console.error(err);
      setError('Unable to analyze the image right now. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderConfidenceMessage = (confidence) => {
    if (confidence >= 0.75) {
      return {
        level: 'High',
        text: 'High-confidence AI result. Still verify the plant condition before taking action.',
        color: 'text-brand-green dark:text-brand-lime',
        bgColor: 'bg-green-50 dark:bg-brand-green/10',
        borderColor: 'border-green-100 dark:border-brand-green/20',
        icon: <CheckCircle className="w-5 h-5 text-brand-green dark:text-brand-lime" />
      };
    } else if (confidence >= 0.50) {
      return {
        level: 'Moderate',
        text: 'Moderate-confidence result. A clearer image may improve reliability.',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-500/10',
        borderColor: 'border-amber-100 dark:border-amber-500/20',
        icon: <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
      };
    } else {
      return {
        level: 'Low',
        text: 'Low-confidence result. Please capture a clearer close-up image.',
        color: 'text-red-500 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-500/10',
        borderColor: 'border-red-100 dark:border-red-500/20',
        icon: <HelpCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
      };
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.detections.length === 0) {
      return (
        <div className="mt-8 bg-gray-50 dark:bg-[#161F33] border border-gray-200 dark:border-[#23314A] rounded-3xl p-6 text-center transition-colors">
          <div className="w-16 h-16 bg-gray-100 dark:bg-[#0B1121] text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <SearchIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">No clear plant condition was detected.</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try taking a closer, well-lit photo of a single leaf.</p>
          <button 
            onClick={resetForm}
            className="mt-6 px-6 py-2.5 bg-white dark:bg-[#1A2640] border border-gray-300 dark:border-[#334666] text-gray-700 dark:text-gray-200 font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-[#202D4A] transition-colors"
          >
            Try Another Image
          </button>
        </div>
      );
    }

    // Consolidate detections: The API already sorts by confidence descending.
    // We just take the first one as the highest confidence primary result.
    const primaryDetection = result.detections[0];
    const confMsg = renderConfidenceMessage(primaryDetection.confidence);

    return (
      <div className="mt-8 bg-white dark:bg-[#161F33] border border-gray-100 dark:border-[#23314A] shadow-card rounded-3xl overflow-hidden transition-colors">
        <div className="bg-brand-surface dark:bg-[#131B2F] p-6 border-b border-gray-100 dark:border-[#23314A] flex items-center gap-3">
           <span className="text-2xl">🌱</span>
           <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">AI Result</h2>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Plant / Condition</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white capitalize leading-tight">
                {primaryDetection.class.replace(/_/g, ' ')}
              </h3>
            </div>
            
            <div className="flex flex-col items-start md:items-end">
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Confidence</p>
               <div className="flex items-end gap-2">
                 <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
                    {Math.round(primaryDetection.confidence * 100)}<span className="text-2xl text-gray-400">%</span>
                 </span>
               </div>
            </div>
          </div>

          <div className={`mt-8 p-4 rounded-2xl flex items-start gap-4 border ${confMsg.bgColor} ${confMsg.borderColor}`}>
            <div className="mt-0.5">{confMsg.icon}</div>
            <div>
              <p className={`font-semibold ${confMsg.color}`}>
                 {confMsg.level} confidence
              </p>
              <p className="text-gray-700 dark:text-gray-200 mt-1 text-sm leading-relaxed">
                {confMsg.text}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 dark:bg-[#1A2640] text-gray-700 dark:text-gray-200 font-semibold rounded-full hover:bg-gray-200 dark:hover:bg-[#202D4A] border border-transparent dark:border-[#334666] transition-colors"
            >
              Analyze Another Image
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1000px] w-full mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Plant Disease Detection</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Detect plant conditions using AI.</p>
        </div>
      </div>

      {/* ── ERROR ALERT ── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl flex items-start gap-3 transition-colors">
          <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── UPLOAD AREA ── */}
      {!result && (
        <div className="bg-white dark:bg-[#161F33] rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 dark:border-[#23314A] flex flex-col transition-colors">
          {!previewUrl ? (
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group outline-none focus-visible:ring-4 focus-visible:ring-brand-green/30 ${
                isDragActive 
                  ? 'border-brand-green bg-brand-green/5 dark:bg-brand-green/10 scale-[1.01]' 
                  : 'border-gray-300 dark:border-[#334666] bg-gray-50 dark:bg-[#1A2640] hover:bg-gray-100 dark:hover:bg-[#202D4A] hover:border-gray-400 dark:hover:border-[#425980]'
              }`}
              onClick={() => fileInputRef.current?.click()}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mb-4 transition-transform duration-300 ${isDragActive ? 'scale-110 bg-brand-green/20' : 'bg-white dark:bg-[#283857] group-hover:scale-110'}`}>
                <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-brand-dark dark:text-brand-lime' : 'text-brand-green dark:text-brand-lime'}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Upload Plant Image</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-sm">
                Drag and drop a clear photo of a plant leaf, or click to browse files.
              </p>
              
              <div className="mt-6 flex gap-3">
                <button 
                  type="button"
                  tabIndex={-1} 
                  className="px-6 py-2.5 bg-brand-dark dark:bg-brand-lime text-white dark:text-brand-darker font-bold text-sm rounded-full shadow hover:bg-brand-darker dark:hover:bg-brand-limeLight hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 outline-none"
                >
                  <ImageIcon className="w-4 h-4" /> Browse Files
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-5 font-medium tracking-wide">SUPPORTS JPG, JPEG, PNG UP TO 10MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-gray-200 dark:border-[#334666] shadow-sm bg-gray-100 dark:bg-[#0B1121]/50">
                <img 
                  src={previewUrl} 
                  alt="Selected plant" 
                  className="w-full h-auto object-cover max-h-[400px]"
                />
                {!isAnalyzing && (
                  <button 
                    onClick={resetForm}
                    className="absolute top-3 right-3 bg-white/90 dark:bg-[#161F33]/90 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-[#161F33] text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Remove image"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="mt-8 flex gap-4 w-full max-w-md">
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 py-3.5 bg-brand-green dark:bg-brand-lime text-white dark:text-brand-dark font-bold rounded-full shadow-md hover:bg-brand-dark dark:hover:bg-brand-limeLight hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg focus:outline-none focus:ring-4 focus:ring-brand-green/30 dark:focus:ring-brand-lime/30"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing your plant...
                    </>
                  ) : (
                    'Analyze Plant'
                  )}
                </button>
              </div>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp,image/jpg" 
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* ── RESULT AREA ── */}
      {renderResult()}

    </div>
  );
};

// Simple search icon since it's not imported from lucide-react above
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default DiseaseDetection;
