import React from 'react';
import { ShieldAlert, AlertTriangle, LifeBuoy, CreditCard, ArrowRight } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  status: string;
  count: number;
  icon: any;
  colorHex: string;
  bgColorClass: string;
  textColorClass: string;
}

import { Link } from 'react-router-dom';

interface AttentionPanelProps {
  items: any[];
}

const AttentionPanel: React.FC<AttentionPanelProps> = ({ items }) => {
  // Map backend attention data to UI formats
  const formattedItems = items.map((item, index) => {
    let icon, colorHex, bgColorClass, textColorClass, status;
    
    if (item.title.includes('Review')) {
      icon = ShieldAlert;
      colorHex = '#F98600';
      bgColorClass = 'bg-[#F98600]/10';
      textColorClass = 'text-[#F98600]';
      status = 'Awaiting review';
    } else if (item.title.includes('Suspended')) {
      icon = AlertTriangle;
      colorHex = '#DC2626';
      bgColorClass = 'bg-[#DC2626]/10';
      textColorClass = 'text-[#DC2626]';
      status = 'Builders suspended';
    } else {
      icon = LifeBuoy;
      colorHex = '#2563EB';
      bgColorClass = 'bg-[#2563EB]/10';
      textColorClass = 'text-[#2563EB]';
      status = 'Needs attention';
    }

    return {
      id: index.toString(),
      title: item.title,
      status: status,
      count: item.count,
      icon,
      colorHex,
      bgColorClass,
      textColorClass,
      link: item.link
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 h-full flex flex-col relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Needs Your Attention</h2>
          <p className="text-[14px] font-medium text-[#64748B] mt-1">Critical tasks and reviews</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 relative z-10">
        {formattedItems.map((item) => (
          <div 
            key={item.id}
            className="group flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer relative overflow-hidden"
          >
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${item.bgColorClass}`}>
                <item.icon size={20} className={item.textColorClass} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-[#0F172A]">{item.title}</span>
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[12px] font-bold ${item.bgColorClass} ${item.textColorClass}`}>
                    {item.count}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[#64748B]">{item.status}</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] group-hover:bg-white group-hover:shadow-sm transition-all duration-300 relative z-10">
              <ArrowRight size={16} className={`group-hover:translate-x-0.5 transition-transform duration-300 group-hover:${item.textColorClass}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttentionPanel;
