import React, { useEffect, useState } from 'react';
import { Server, Database, Activity, CheckCircle2 } from 'lucide-react';

const PlatformHealth: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const target = 99.98;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(target);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 h-full flex flex-col relative overflow-hidden group">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Platform Health</h2>
          <p className="text-[14px] font-medium text-slate-500 mt-1">Real-time system status</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-2 mb-8">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="8"
            />
            {/* Progress Stroke */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#10B981"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[32px] font-black tracking-tight text-[#0F172A] leading-none mb-1">
              99.98<span className="text-[16px] text-slate-400 font-bold ml-0.5">%</span>
            </span>
            <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-[0.15em]">Uptime</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        
        {/* API Status */}
        <div className="group flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Server size={16} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </div>
          </div>
          <p className="text-[13px] font-semibold text-slate-500">API Status</p>
        </div>

        {/* Database */}
        <div className="group flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Database size={16} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </div>
          </div>
          <p className="text-[13px] font-semibold text-slate-500">Database</p>
        </div>
        
        {/* Active Projects */}
        <div className="group flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-bold text-[#0F172A]">47</span>
          </div>
          <p className="text-[13px] font-semibold text-slate-500">Active Projects</p>
        </div>

        {/* Open Support */}
        <div className="group flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CheckCircle2 size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-bold text-[#0F172A]">6</span>
          </div>
          <p className="text-[13px] font-semibold text-slate-500">Open Tickets</p>
        </div>

      </div>
    </div>
  );
};

export default PlatformHealth;
