import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        fill={fill}
        cornerRadius={2}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0B1F33]/90 backdrop-blur-md border border-[#132d47] shadow-xl rounded-xl p-3 px-4 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
        <div>
          <p className="text-[12px] font-medium text-white/70 uppercase tracking-wider">{data.name}</p>
          <p className="text-[15px] font-bold text-white">{data.value} Subscriptions</p>
        </div>
      </div>
    );
  }
  return null;
};

interface SubscriptionDistributionProps {
  data: any[];
  activeBuilders: number;
}

const SubscriptionDistribution: React.FC<SubscriptionDistributionProps> = ({ data, activeBuilders }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const colors = ['#2563EB', '#00B5B8', '#7C5CFC', '#F59E0B', '#10B981'];
  
  const displayData = data.length > 0 ? data.map((d, idx) => ({
    // New DashboardView returns {name, count, id}; old Django aggregate returned {subscription_plan__name, count}
    name: d.name || d.subscription_plan__name || 'Unknown Plan',
    value: d.count,
    color: colors[idx % colors.length]
  })) : [
    { name: 'No Plans Found', value: 1, color: '#E2E8F0' } // Fallback empty state
  ];


  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 h-full flex flex-col relative overflow-hidden group">

      <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight mb-2 z-10 relative">Subscription Distribution</h2>
      <p className="text-[14px] font-medium text-[#64748B] mb-6 z-10 relative">Current active plans across the platform</p>

      <div className="flex-1 relative z-10">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="text-[40px] font-black text-[#0F172A] leading-none mb-1">{activeBuilders}</span>
          <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Active</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeShape={activeIndex !== -1 ? renderActiveShape : undefined}
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              cornerRadius={6}
              stroke="none"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.05))' }} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4 relative z-10">
        {displayData.map((item, index) => (
          <div 
            key={item.name} 
            className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
            style={{ opacity: activeIndex === index ? 1 : 0.6 }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[13px] font-bold text-[#0F172A]">{item.name}</span>
            <span className="text-[13px] font-medium text-[#64748B]">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionDistribution;
