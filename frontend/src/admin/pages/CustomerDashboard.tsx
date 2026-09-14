import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, MessageSquare, ArrowRight, CheckCircle2, Home as HomeIcon, CheckSquare, TrendingUp, AlertTriangle, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi } from '../../api/services';
import { User } from '../../types/models';
import { UnitWorkspace } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { Link } from 'react-router-dom';
import { friendlyStatus } from '../../utils/customerCopy';
import KPIOrb from '../components/KPIOrb';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<UnitWorkspace | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.unitId) {
        setLoading(false);
        return;
      }
      try {
        const data = await unitsApi.getWorkspace(user.unitId);
        setWorkspace(data);
      } catch (error) {
        console.error('Error fetching customer workspace:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <PageLoading />;

  // Empty state if no unit is assigned
  if (!user?.unitId || !workspace?.unit) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[#F8FAFC] gap-4">
        <HomeIcon size={48} className="text-slate-300" />
        <div className="text-center">
          <p className="font-semibold text-slate-700 text-lg">No Property Assigned</p>
          <p className="text-sm text-slate-400 mt-1">Your property has not been assigned yet. Please contact your builder or administrator for assistance.</p>
        </div>
      </div>
    );
  }

  const { unit, counts, readiness, latestInspection } = workspace;
  const firstName = user?.name?.split(' ')[0] || 'Customer';

  // Determine Actions
  const attentionItems: any[] = [];
  
  if (!readiness.defects_ready && (counts?.open_defects || 0) > 0) {
    attentionItems.push({
      label: 'Issues',
      message: `${counts?.open_defects || 0} reported issues require your attention or are being resolved.`,
      link: '/admin/customer-issues',
      color: 'text-amber-600',
      icon: MessageSquare
    });
  }
  
  if (!readiness.payment_ready) {
    attentionItems.push({
      label: 'Payments',
      message: 'Pending payments must be cleared before possession.',
      link: '/admin/customer-payments',
      color: 'text-amber-600',
      icon: CreditCard
    });
  }
  
  if (!readiness.documents_ready) {
    attentionItems.push({
      label: 'Documents',
      message: 'Please upload or review your pending documents.',
      link: '/admin/customer-documents',
      color: 'text-amber-600',
      icon: FileText
    });
  }
  
  if (readiness.inspection_ready && readiness.payment_ready && readiness.documents_ready && !readiness.keys_handed_over) {
    attentionItems.push({
      label: 'Handover',
      message: 'Congratulations! Your property is ready for key handover.',
      link: '/admin/customer-handover',
      color: 'text-emerald-600',
      icon: CheckCircle2
    });
  }

  const steps = [
    { label: 'Booking', completed: true },
    { label: 'Construction', completed: readiness.construction_ready },
    { label: 'Inspection', completed: readiness.inspection_ready },
    { label: 'Clearance', completed: readiness.documents_ready && readiness.payment_ready },
    { label: 'Handover', completed: readiness.keys_handed_over }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* 1. GREETING & PAGE HEADER */}
        <section className="flex flex-col mb-10 mt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4 shadow-sm self-start">
            <HomeIcon size={14} className="text-[#3B82F6]" />
            My Home
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
            Good morning, {firstName}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-[15px] leading-relaxed">
            Here's the latest update on your home.
          </p>
        </section>

        {/* 2. PRIMARY PROPERTY SUMMARY */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0 text-[#3B82F6]">
              <Building2 size={32} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1 tracking-wide uppercase">{unit.project_name || 'Your Project'}</div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">Unit {unit.name}</div>
              <div className="text-sm text-slate-500 mt-1">
                {unit.block_name || 'Block'} • {unit.floor_name || 'Floor'} • {unit.type || 'Apartment'}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 md:gap-12 bg-slate-50 rounded-lg p-4 border border-slate-100">
             <div>
               <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
               <div className="font-bold text-slate-800">{friendlyStatus(unit.status)}</div>
             </div>
             {/* Note: Real expected handover date & completion % usually come from project or unit API. 
                 Using readiness flags as a proxy for progress if explicit completion % is unavailable */}
          </div>
        </section>

        {/* 3. SUMMARY / STATUS CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <KPIOrb 
            title="Inspection" 
            value={latestInspection?.status === 'completed' ? 'Passed' : (latestInspection?.status || 'Pending')} 
            icon={CheckSquare} 
            colorHex={readiness.inspection_ready ? '#10B981' : '#F59E0B'}
          />
          <KPIOrb 
            title="Issues" 
            value={`${counts?.open_defects || 0} Open`} 
            icon={MessageSquare} 
            colorHex={(counts?.open_defects || 0) === 0 ? '#10B981' : '#EF4444'}
          />
          <KPIOrb 
            title="Documents" 
            value={readiness.documents_ready ? 'Cleared' : 'Pending'} 
            icon={FileText} 
            colorHex={readiness.documents_ready ? '#10B981' : '#F59E0B'}
          />
          <KPIOrb 
            title="Payments" 
            value={readiness.payment_ready ? 'Cleared' : 'Balance Due'} 
            icon={CreditCard} 
            colorHex={readiness.payment_ready ? '#10B981' : '#EF4444'}
          />
          <KPIOrb 
            title="Handover" 
            value={readiness.keys_handed_over ? 'Complete' : 'Not Yet'} 
            icon={CheckCircle2} 
            colorHex={readiness.keys_handed_over ? '#10B981' : '#64748B'}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 4. NEEDS YOUR ATTENTION */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-slate-700" />
                <h2 className="text-lg font-bold text-slate-900">Needs Your Attention</h2>
              </div>
              
              {attentionItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">You're all caught up.</h3>
                  <p className="text-slate-500 text-sm">There are no pending actions required from your side right now.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {attentionItems.map((item, idx) => (
                    <Link key={idx} to={item.link} className="block group">
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 ${item.color}`}>
                            <item.icon size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{item.label}</div>
                            <div className="text-sm text-slate-500">{item.message}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-sm text-[#3B82F6]">
                          View <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 5. RECENT / QUICK ACCESS */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/admin/customer-inspection" className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-center group">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <CheckSquare size={20} />
                  </div>
                  <div className="font-semibold text-sm text-slate-900">Inspection</div>
                </Link>
                <Link to="/admin/customer-issues" className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-center group">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <MessageSquare size={20} />
                  </div>
                  <div className="font-semibold text-sm text-slate-900">Issues</div>
                </Link>
                <Link to="/admin/customer-documents" className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-center group">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="font-semibold text-sm text-slate-900">Documents</div>
                </Link>
                <Link to="/admin/customer-payments" className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-center group">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <CreditCard size={20} />
                  </div>
                  <div className="font-semibold text-sm text-slate-900">Payments</div>
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: PROGRESS / HANDOVER JOURNEY */}
          <div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Your Progress</h2>
              </div>
              
              <div className="relative pl-6">
                <div className="absolute top-2 bottom-6 left-[11px] w-0.5 bg-slate-100" />
                
                {steps.map((step, idx) => (
                  <div key={idx} className={`relative ${idx === steps.length - 1 ? 'mb-0' : 'mb-8'}`}>
                    <div className={`absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 bg-white ${step.completed ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {step.completed && <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <div className={`text-[15px] ${step.completed ? 'font-bold text-slate-900' : 'font-semibold text-slate-400'}`}>
                      {step.label}
                    </div>
                    <div className="text-[13px] text-slate-500 mt-1">
                      {step.completed ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;
