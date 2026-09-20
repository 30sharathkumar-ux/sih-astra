import React from 'react';

const GreenhouseVisual = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-card relative group h-[190px] md:min-h-full">
      <div className="w-full h-full relative">
        <svg className="w-full h-full object-cover" fill="none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 210">
          <rect fill="#EBF4F6" height="210" width="340"></rect>
          <circle cx="170" cy="110" fill="#FEF9C3" opacity="0.6" r="70"></circle>
          
          <path d="M 30 210 Q 170 -10 310 210" fill="none" stroke="#CBD5E1" strokeWidth="2.5"></path>
          <path d="M 60 210 Q 170 30 280 210" fill="none" stroke="#CBD5E1" strokeWidth="2"></path>
          <path d="M 90 210 Q 170 60 250 210" fill="none" stroke="#CBD5E1" strokeWidth="1.5"></path>
          
          <g transform="translate(155, 95) scale(0.6)">
            <rect fill="#15803D" height="12" rx="2" width="20" x="0" y="8"></rect>
            <circle cx="5" cy="22" fill="#1E293B" r="5"></circle>
            <circle cx="20" cy="20" fill="#1E293B" r="7"></circle>
            <rect fill="#93C5FD" height="8" width="10" x="5" y="0"></rect>
          </g>
          
          <path d="M 0 210 L 140 120 L 160 120 L 80 210 Z" fill="#65A30D"></path>
          <path d="M 0 170 L 120 120 L 135 120 L 20 210 Z" fill="#4D7C0F"></path>
          <path d="M 0 210 L 140 130" stroke="#365314" strokeDasharray="6,4" strokeWidth="3"></path>
          
          <polygon fill="#FDE68A" points="140,120 200,120 230,210 110,210"></polygon>
          
          <path d="M 200 120 L 340 210 L 260 210 L 180 120 Z" fill="#65A30D"></path>
          <path d="M 220 120 L 340 180 L 340 210 L 240 210 Z" fill="#4D7C0F"></path>
          <path d="M 200 130 L 340 210" stroke="#365314" strokeDasharray="6,4" strokeWidth="3"></path>
          
          <g transform="translate(180, 100)">
            <ellipse cx="40" cy="98" fill="#14532D" opacity="0.3" rx="24" ry="6"></ellipse>
            <circle cx="36" cy="26" fill="#FDBA74" r="8"></circle>
            <path d="M26 22 C26 17, 46 17, 46 22 L48 24 L24 24 Z" fill="#1E293B"></path>
            <path d="M24 24 L16 26" stroke="#1E293B" strokeLinecap="round" strokeWidth="3"></path>
            <path d="M28 34 L48 34 L54 65 L24 65 Z" fill="#FFFFFF"></path>
            <path d="M28 46 L48 46 L49 85 L27 85 Z" fill="#1E3A5F"></path>
            <rect fill="#1E3A5F" height="14" width="3" x="33" y="34"></rect>
            <rect fill="#1E3A5F" height="14" width="3" x="42" y="34"></rect>
            <path d="M25 40 L10 56 L18 64 L30 45" fill="#FFFFFF"></path>
            <rect fill="#B45309" height="16" rx="3" width="22" x="6" y="52"></rect>
            <circle cx="12" cy="54" fill="#84CC16" r="3"></circle>
            <circle cx="18" cy="53" fill="#EF4444" r="3"></circle>
            <circle cx="22" cy="55" fill="#84CC16" r="3"></circle>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default GreenhouseVisual;
