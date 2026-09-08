import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xl rounded-xl p-4 min-w-[180px]">
        <p className="text-[13px] font-bold text-[#0F172A] mb-3 uppercase tracking-wider border-b border-[#E2E8F0] pb-2">{label} Performance</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex justify-between items-center mb-1.5 last:mb-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[13px] font-medium text-[#64748B] capitalize">{entry.name}</span>
            </div>
            <span className="text-[14px] font-bold text-[#0F172A]">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface PlatformGrowthProps {
  data: any[];
}

const PlatformGrowth: React.FC<PlatformGrowthProps> = ({ data }) => {
  const [period, setPeriod] = useState('6M');
  const periods = ['7D', '30D', '6M', '1Y'];

  const displayData = data.length > 0 ? data : [
    { name: 'Jan', projects: 0, units: 0, users: 0 },
    { name: 'Feb', projects: 0, units: 0, users: 0 },
  ]; // fallback empty chart

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 relative overflow-hidden h-full flex flex-col">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Platform Growth</h2>
          <p className="text-[14px] font-medium text-[#64748B] mt-1">Handoverly platform growth and performance</p>
        </div>
        
        <div className="flex items-center bg-[#F1F5F9] rounded-lg p-1 border border-[#E2E8F0]">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all duration-200 ${
                period === p 
                  ? 'bg-white text-[#2563EB] shadow-sm' 
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00B5B8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00B5B8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="units" 
              stroke="#00B5B8" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUnits)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#00B5B8' }}
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="projects" 
              stroke="#2563EB" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProjects)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#2563EB' }}
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="users" 
              stroke="#7C5CFC" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsers)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#7C5CFC' }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlatformGrowth;
