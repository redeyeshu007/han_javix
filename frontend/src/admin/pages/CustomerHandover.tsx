import React, { useState, useEffect } from 'react';
import { Key, FileText, CreditCard, ShieldCheck, ClipboardCheck, CheckCircle2, Clock, Calendar, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi } from '../../api/services';
import { User } from '../../types/models';
import { UnitWorkspace } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { computeHandoverReadiness } from '../../utils/handoverReadiness';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerHandover: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<UnitWorkspace | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.unitId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await unitsApi.getWorkspace(user.unitId);
        setWorkspace(data);
      } catch (error) {
        console.error('Error fetching handover data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <PageLoading />;
  
  if (!workspace?.unit) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 bg-[#F8FAFC]">
        <Home size={64} className="opacity-20 mb-6" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Home Linked Yet</h3>
        <p className="text-slate-500">Your home details will appear here once your builder links them to your account.</p>
      </div>
    );
  }

  const { unit, documents = [], payments = [], defects = [], readiness } = workspace;

  let r;
  if (readiness) {
    r = readiness;
  } else {
    // fallback if readiness is not returned
    r = computeHandoverReadiness(
      { inspectionStatus: unit.inspectionStatus },
      documents,
      payments,
      defects
    );
  }

  const inspectionOk = r.inspectionCleared;
  const defectsOk = r.defectsCleared;
  const documentsOk = r.docsCleared;
  const paymentOk = r.paymentCleared;
  const approvalsOk = r.approvalsCleared;

  const isReady = inspectionOk && defectsOk && documentsOk && paymentOk && approvalsOk;
  const isHandedOver = unit.status === 'handed_over' || unit.status === 'Handed Over';

  const items = [
    { label: 'Property Inspection', desc: 'Final quality check', ok: inspectionOk, icon: ClipboardCheck, hint: friendlyStatus(unit.inspectionStatus) },
    { label: 'Issue Resolution', desc: 'All reported defects closed', ok: defectsOk, icon: ShieldCheck, hint: defectsOk ? 'All cleared' : 'Open items remain' },
    { label: 'Legal Documents', desc: 'Agreements & proofs verified', ok: documentsOk, icon: FileText, hint: documentsOk ? 'Verified' : 'Pending verification' },
    { label: 'Final Payments', desc: 'All dues cleared', ok: paymentOk, icon: CreditCard, hint: paymentOk ? 'Cleared' : 'Balance due' },
    { label: 'Builder Approvals', desc: 'Management sign-off', ok: approvalsOk, icon: Key, hint: approvalsOk ? 'Approved' : 'Awaiting approval' }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2">
              Handover Readiness
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              Track everything required before the keys to {unit.name} are handed over.
            </p>
          </div>
        </section>

        {isHandedOver ? (
          <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white text-center shadow-lg">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
              <Key size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Welcome Home!</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Your property handover is complete. You can now use the Warranty & Care section to report any post-handover issues covered under your warranty period.
            </p>
            <div className="inline-flex gap-4">
              <button className="px-6 py-3 bg-white text-slate-900 border-none rounded-xl font-bold text-[15px] flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                <FileText size={18} /> View Handover Certificate
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className={`rounded-2xl p-6 md:p-8 text-white flex flex-col transition-colors duration-400 ${isReady ? 'bg-emerald-600 shadow-[0_10px_15px_-3px_rgba(5,150,105,0.4)]' : 'bg-slate-900 shadow-lg'}`}>
                <div className="flex items-center gap-4 mb-6">
                  {isReady ? (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Clock size={28} className="text-white" />
                    </div>
                  )}
                  <h2 className="m-0 text-2xl font-bold tracking-tight">
                    {isReady ? 'READY FOR HANDOVER' : 'NOT READY YET'}
                  </h2>
                </div>
                <p className="m-0 mb-8 text-[15px] text-white/80 leading-relaxed">
                  {isReady ? 'All requirements are complete. Your handover appointment can be scheduled by the builder.' : 'Complete the pending requirements below to unlock your handover appointment scheduling.'}
                </p>
                
                {isReady && (
                  <div className="p-6 bg-black/15 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-[13px] font-bold uppercase tracking-wider text-white/70 mb-2">Next Step</div>
                      <div className="text-lg font-bold">Schedule Appointment</div>
                    </div>
                    <button className="px-5 py-3 bg-white text-emerald-600 rounded-xl border-none font-bold text-[14px] cursor-pointer flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                      <Calendar size={18} /> Schedule
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">What's Left To Do</h3>
                <div className="flex flex-col">
                  {items.map((item, idx) => (
                    <div key={item.label} className={`flex items-center justify-between py-5 ${idx === items.length - 1 ? '' : 'border-b border-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.ok ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                          <item.icon size={20} className={item.ok ? 'text-emerald-500' : 'text-slate-400'} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[15px]">{item.label}</div>
                          <div className="text-[13px] text-slate-500 mt-1 font-medium">{item.desc}</div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[12px] font-semibold border ${item.ok ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                          {item.ok ? 'Cleared' : 'Pending'}
                        </span>
                        <div className="text-[12px] text-slate-400 font-semibold tracking-wide">
                          {item.hint}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Handover Process</h3>
                
                <div className="relative pl-6">
                  <div className="absolute top-2 bottom-6 left-[7px] w-0.5 bg-slate-200" />
                  
                  <div className="relative mb-8">
                    <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-transparent" />
                    <div className="text-[14px] font-bold text-slate-800">Booking & Construction</div>
                    <div className="text-[13px] text-slate-500 mt-1 font-medium">Completed</div>
                  </div>
                  
                  <div className="relative mb-8">
                    <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-white ${inspectionOk && defectsOk ? 'bg-emerald-500 ring-2 ring-transparent' : 'bg-slate-800 ring-2 ring-slate-200'}`} />
                    <div className="text-[14px] font-bold text-slate-800">Final Inspection</div>
                    <div className="text-[13px] text-slate-500 mt-1 font-medium">{inspectionOk && defectsOk ? 'Completed' : 'In Progress'}</div>
                  </div>
                  
                  <div className="relative mb-8">
                    <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-white ${documentsOk && paymentOk ? 'bg-emerald-500 ring-2 ring-transparent' : (inspectionOk && defectsOk ? 'bg-slate-800 ring-2 ring-slate-200' : 'bg-slate-200 ring-2 ring-transparent')}`} />
                    <div className={`text-[14px] font-bold ${documentsOk && paymentOk ? 'text-slate-800' : (inspectionOk && defectsOk ? 'text-slate-800' : 'text-slate-400')}`}>Documents & Payments</div>
                    <div className="text-[13px] text-slate-500 mt-1 font-medium">{documentsOk && paymentOk ? 'Completed' : 'Pending'}</div>
                  </div>
                  
                  <div className="relative">
                    <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-white ${isReady ? 'bg-slate-800 ring-2 ring-slate-200' : 'bg-slate-200 ring-2 ring-transparent'}`} />
                    <div className={`text-[14px] font-bold ${isReady ? 'text-slate-800' : 'text-slate-400'}`}>Key Handover</div>
                    <div className="text-[13px] text-slate-500 mt-1 font-medium">Final step</div>
                  </div>
                </div>
              </div>
              
              {!isReady && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h4 className="m-0 mb-2 text-sm font-bold text-slate-800 uppercase tracking-wider">Need Help?</h4>
                  <p className="m-0 mb-4 text-[13px] text-slate-600 leading-relaxed font-medium">If you have questions about what's still pending, our support team is happy to help.</p>
                  <button className="w-full px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                    Contact Support
                  </button>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerHandover;
