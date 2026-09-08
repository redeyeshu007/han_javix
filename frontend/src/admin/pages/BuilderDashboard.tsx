import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Home,
  CheckCircle2,
  FileText,
  Activity,
  AlertCircle,
  Plus,
  RefreshCw,
  XOctagon,
  ArrowRight,
  ShieldAlert,
  LifeBuoy
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIOrb from '../components/KPIOrb';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardMetrics {
  kpis: {
    total_projects: number;
    active_projects: number;
    total_units: number;
    units_nearing_handover: number;
    open_defects: number;
    customer_handovers: number;
    financial_clearance_pending: number;
    association_handover_status: string;
  };
  needs_attention: Array<{
    title: string;
    count: number;
    description: string;
    link: string;
  }>;
  chart_data: Array<{
    name: string;
    full_label: string;
    Units: number;
    Defects: number;
    Handovers: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xl rounded-xl p-4 min-w-[180px]">
        <p className="text-[13px] font-bold text-[#0F172A] mb-3 uppercase tracking-wider border-b border-[#E2E8F0] pb-2">{label} Metrics</p>
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

const BuilderDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const response = await apiClient.get<DashboardMetrics>('/builders/dashboard-metrics/');
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Builder Dashboard API Error:', err.response?.status, err.response?.data || err.message);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh every 30 seconds (silent — no spinner)
    const interval = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const displayChartData = data?.chart_data?.length ? data.chart_data : [
    { name: 'Jan', full_label: 'Jan', Units: 0, Handovers: 0, Defects: 0 },
    { name: 'Feb', full_label: 'Feb', Units: 0, Handovers: 0, Defects: 0 },
    { name: 'Mar', full_label: 'Mar', Units: 0, Handovers: 0, Defects: 0 },
    { name: 'Apr', full_label: 'Apr', Units: 0, Handovers: 0, Defects: 0 },
    { name: 'May', full_label: 'May', Units: 0, Handovers: 0, Defects: 0 },
    { name: 'Jun', full_label: 'Jun', Units: 0, Handovers: 0, Defects: 0 },
  ];

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#E2E8F0'];
  const distributionData = data ? [
    { name: 'Nearing Handover', value: data.kpis.units_nearing_handover },
    { name: 'Customer Handovers', value: data.kpis.customer_handovers },
    { name: 'Financial Pending', value: data.kpis.financial_clearance_pending },
    { name: 'Other', value: Math.max(0, data.kpis.total_units - data.kpis.units_nearing_handover - data.kpis.customer_handovers - data.kpis.financial_clearance_pending) }
  ] : [];

  const healthProgress = data?.kpis?.total_projects && data.kpis.total_projects > 0 
    ? (data.kpis.active_projects / data.kpis.total_projects) * 100 
    : 0;

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      
      {/* Background ambient light matching the landing page */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#2563EB]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full">

        {/* ==================================================
            1. HERO SECTION 
        ================================================== */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-[32px] font-bold text-[#0B1F33] tracking-tight">
              Good morning, Builder
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-[15px] text-[#64748B] font-medium">
                Real-time portfolio overview.
              </p>
              {lastUpdated && (
                <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboard(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 text-[13px] font-semibold rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200"
            >
              <RefreshCw size={14} className="mr-1.5" />
              Refresh
            </button>
            <Link
              to="/builder/projects"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-bold rounded-xl shadow-[0_8px_16px_-4px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_24px_-6px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus size={18} className="mr-2" strokeWidth={3} />
              New Project
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
          </div>
        ) : error || !data ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <XOctagon className="text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">{error || 'An unexpected error occurred.'}</h3>
            <button onClick={() => fetchDashboard()} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">Retry</button>
          </div>
        ) : (
          <>
            {/* ==================================================
                2. KPI CONSTELLATION
            ================================================== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
              <KPIOrb
                title="Active Projects"
                value={data.kpis.active_projects}
                subtitle={`Of ${data.kpis.total_projects} Total Projects`}
                percentage={data.kpis.total_projects ? Math.round((data.kpis.active_projects / data.kpis.total_projects) * 100) : 0}
                icon={Building2}
                colorHex="#2563EB" // Blue
                glowColorHex="#2563EB"
              />
              <KPIOrb
                title="Total Units"
                value={data.kpis.total_units}
                icon={Home}
                colorHex="#60A5FA" // Sky
              />
              <KPIOrb
                title="Nearing Handover"
                value={data.kpis.units_nearing_handover}
                icon={Activity}
                colorHex="#F59E0B" // Amber
              />
              <KPIOrb
                title="Handovers"
                value={data.kpis.customer_handovers}
                icon={CheckCircle2}
                colorHex="#12B76A" // Green
              />
              <KPIOrb
                title="Open Defects"
                value={data.kpis.open_defects}
                icon={AlertCircle}
                colorHex="#DC2626" // Red
              />
            </section>

            {/* ==================================================
                3. MAIN CONTENT (GROWTH & ACTIONS)
            ================================================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
              
              {/* Portfolio Growth Chart */}
              <div className="lg:col-span-8 min-h-[460px]">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 relative overflow-hidden h-full flex flex-col">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Portfolio Growth</h2>
                      <p className="text-[14px] font-medium text-[#64748B] mt-1">Real data · Last 6 months</p>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#2563EB]" />Units Added</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10B981]" />Handovers</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F59E0B]" />Defects</span>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorHandovers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDefects" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
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
                          allowDecimals={false}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="Units" 
                          stroke="#2563EB" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorUnits)" 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#2563EB' }}
                          animationDuration={1200}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Handovers" 
                          stroke="#10B981" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorHandovers)" 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                          animationDuration={1200}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Defects" 
                          stroke="#F59E0B" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorDefects)" 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#F59E0B' }}
                          animationDuration={1200}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Attention Panel */}
              <div className="lg:col-span-4 min-h-[460px]">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 h-full flex flex-col relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Needs Your Attention</h2>
                      <p className="text-[14px] font-medium text-[#64748B] mt-1">Critical tasks and reviews</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4 relative z-10">
                    {data.needs_attention.map((item, index) => {
                      // Dynamically assign icon/color based on keywords
                      let IconComp = LifeBuoy;
                      let colorHex = '#2563EB';
                      let bgColorClass = 'bg-[#2563EB]/10';
                      let textColorClass = 'text-[#2563EB]';
                      
                      if (item.title.toLowerCase().includes('defect') || item.title.toLowerCase().includes('critical')) {
                        IconComp = ShieldAlert;
                        colorHex = '#DC2626';
                        bgColorClass = 'bg-[#DC2626]/10';
                        textColorClass = 'text-[#DC2626]';
                      } else if (item.title.toLowerCase().includes('pending') || item.title.toLowerCase().includes('delayed')) {
                        IconComp = AlertCircle;
                        colorHex = '#F98600';
                        bgColorClass = 'bg-[#F98600]/10';
                        textColorClass = 'text-[#F98600]';
                      }

                      return (
                        <Link 
                          to={item.link || '#'}
                          key={index}
                          className="group flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer relative overflow-hidden"
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${bgColorClass}`}>
                              <IconComp size={20} className={textColorClass} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[16px] font-bold text-[#0F172A]">{item.title}</span>
                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[12px] font-bold ${bgColorClass} ${textColorClass}`}>
                                  {item.count}
                                </span>
                              </div>
                              <p className="text-[13px] font-medium text-[#64748B]">{item.description}</p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] group-hover:bg-white group-hover:shadow-sm transition-all duration-300 relative z-10">
                            <ArrowRight size={16} className={`group-hover:translate-x-0.5 transition-transform duration-300 group-hover:${textColorClass}`} />
                          </div>
                        </Link>
                      );
                    })}
                    
                    {data.needs_attention.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                        <CheckCircle2 size={48} className="mb-4 text-emerald-400" />
                        <p className="font-medium text-slate-600">All caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </section>

            {/* ==================================================
                4. BOTTOM CONTENT (HEALTH & DISTRIBUTION)
            ================================================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
              
              {/* Portfolio Health */}
              <div className="lg:col-span-6 min-h-[420px]">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 h-full flex flex-col relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Portfolio Health</h2>
                      <p className="text-[14px] font-medium text-slate-500 mt-1">Project activity and progression</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-center py-2 mb-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="54" fill="none" stroke="#10B981" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 54}
                          strokeDashoffset={(2 * Math.PI * 54) - ((healthProgress || 0) / 100) * (2 * Math.PI * 54)}
                          className="transition-all duration-1500 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[32px] font-black tracking-tight text-[#0F172A] leading-none mb-1">
                          {healthProgress.toFixed(0)}<span className="text-[16px] text-slate-400 font-bold ml-0.5">%</span>
                        </span>
                        <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-[0.15em]">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="group flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Building2 size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[16px] font-bold text-[#0F172A]">{data.kpis.active_projects}</span>
                      </div>
                      <p className="text-[13px] font-semibold text-slate-500">Active Projects</p>
                    </div>
                    <div className="group flex flex-col p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <CheckCircle2 size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[16px] font-bold text-[#0F172A]">{data.kpis.customer_handovers}</span>
                      </div>
                      <p className="text-[13px] font-semibold text-slate-500">Completed Handovers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Distribution */}
              <div className="lg:col-span-6 min-h-[420px]">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 h-full flex flex-col">
                  <div className="flex flex-col md:flex-row justify-between mb-8">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Unit Distribution</h2>
                      <p className="text-[14px] font-medium text-[#64748B] mt-1">Breakdown of unit progress</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <div className="text-[24px] font-bold text-[#0F172A]">{data.kpis.total_units}</div>
                      <p className="text-[12px] font-medium text-[#64748B] uppercase tracking-wider">Total Units</p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="h-[220px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#0F172A', fontWeight: 600, fontSize: '14px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {distributionData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-semibold text-[#0F172A] truncate">{entry.name}</span>
                          <span className="text-[12px] font-medium text-[#64748B]">{entry.value} Units</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default BuilderDashboard;
