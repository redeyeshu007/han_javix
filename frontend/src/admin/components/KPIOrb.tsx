import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface KPIOrbProps {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number; // 0-100
  icon: LucideIcon;
  colorHex: string;
  glowColorHex?: string; // Kept for backwards compatibility with props, but ignored in styling
}

const KPIOrb: React.FC<KPIOrbProps> = ({ 
  title, 
  value, 
  subtitle, 
  percentage, 
  icon: Icon, 
  colorHex 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // Animate progress on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(percentage || 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = percentage !== undefined 
    ? circumference - (animatedProgress / 100) * circumference 
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
        >
          <Icon size={16} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex items-end justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[28px] font-bold tracking-tight text-[#0F172A] leading-none mb-1">
            {value}
          </span>
          {subtitle && (
            <span className="text-[12px] font-medium text-slate-500">
              {subtitle}
            </span>
          )}
        </div>

        {percentage !== undefined && (
          <div className="relative w-14 h-14 flex-shrink-0 ml-4">
            {/* SVG Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                fill="none"
                stroke="#F1F5F9" // slate-100
                strokeWidth="4"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                fill="none"
                stroke={colorHex}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold text-[#0F172A]">{animatedProgress.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default KPIOrb;
