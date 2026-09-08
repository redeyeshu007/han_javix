import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Users,
  HardHat,
  AlertCircle,
  XOctagon,
  Activity
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIOrb from '../components/KPIOrb';
import PlatformGrowth from '../components/PlatformGrowth';
import PlatformHealth from '../components/PlatformHealth';
import SubscriptionDistribution from '../components/SubscriptionDistribution';
import AttentionPanel from '../components/AttentionPanel';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/platform-admin/dashboard/');
        setData(response.data);
      } catch (err) {
        setError('Unable to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
              Good morning, Admin
            </h1>
            <p className="text-[15px] text-[#64748B] mt-2 font-medium">
              Here's what's happening across Handoverly today.
            </p>
          </div>
          <Link
            to="/admin/builders/new"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-bold rounded-xl shadow-[0_8px_16px_-4px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_24px_-6px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus size={18} className="mr-2" strokeWidth={3} />
            Add Builder
          </Link>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <XOctagon className="text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800">{error}</h3>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">Retry</button>
          </div>
        ) : (
          <>
            {/* ==================================================
                2. KPI CONSTELLATION
            ================================================== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
              <KPIOrb
                title="Total Builders"
                value={data?.kpis?.total_builders || 0}
                icon={HardHat}
                colorHex="#2563EB" // Blue
              />
              <KPIOrb
                title="Active Builders"
                value={data?.kpis?.active_builders || 0}
                subtitle="Of Total Builders"
                percentage={data?.kpis?.total_builders ? Math.round((data.kpis.active_builders / data.kpis.total_builders) * 100) : 0}
                icon={Activity}
                colorHex="#12B76A" // Green
                glowColorHex="#12B76A"
              />
              <KPIOrb
                title="Pending Reviews"
                value={data?.kpis?.pending_reviews || 0}
                icon={AlertCircle}
                colorHex="#F59E0B" // Amber
              />
              <KPIOrb
                title="Active Users"
                value={data?.kpis?.active_users || 0}
                icon={Users}
                colorHex="#60A5FA" // Sky
              />
              <KPIOrb
                title="Suspended"
                value={data?.kpis?.suspended_builders || 0}
                icon={XOctagon}
                colorHex="#DC2626" // Red
              />
            </section>

            {/* ==================================================
                3. MAIN CONTENT (GROWTH & ACTIONS)
            ================================================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
              <div className="lg:col-span-8 min-h-[460px]">
                <PlatformGrowth data={data?.growth || []} />
              </div>
              <div className="lg:col-span-4 min-h-[460px]">
                <AttentionPanel items={data?.attention || []} />
              </div>
            </section>

            {/* ==================================================
                4. BOTTOM CONTENT (HEALTH & DISTRIBUTION)
            ================================================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
              <div className="lg:col-span-6 min-h-[420px]">
                <PlatformHealth />
              </div>
              <div className="lg:col-span-6 min-h-[420px]">
                <SubscriptionDistribution data={data?.subscription_distribution || []} activeBuilders={data?.kpis?.active_builders || 0} />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
