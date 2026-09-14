import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Grid, Activity, Maximize, BedDouble, Bath, CarFront, FileText, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi } from '../../api/services';
import { User } from '../../types/models';
import { UnitWorkspace } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { friendlyStatus } from '../../utils/customerCopy';
import KPIOrb from '../components/KPIOrb';

const CustomerHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<UnitWorkspace | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!user?.unitId) {
        setLoading(false);
        return;
      }
      try {
        const data = await unitsApi.getWorkspace(user.unitId);
        setWorkspace(data);
      } catch (error) {
        console.error('Error fetching home workspace:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [user]);

  if (loading) return <PageLoading />;
  
  if (!user?.unitId || !workspace?.unit) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[#F8FAFC] gap-4">
        <Building2 size={48} className="text-slate-300" />
        <div className="text-center">
          <p className="font-semibold text-slate-700 text-lg">No Home Assigned Yet</p>
          <p className="text-sm text-slate-400 mt-1">Your property details will appear here once they are assigned to your account.</p>
        </div>
      </div>
    );
  }

  const { unit, counts, readiness } = workspace;

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Header Section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 mt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4 shadow-sm">
              <Building2 size={14} className="text-[#3B82F6]" />
              {unit.type || 'Apartment'}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
              {unit.name}
            </h1>
            <p className="flex items-center gap-2 text-slate-500 mt-2 max-w-2xl text-[15px] leading-relaxed">
              <MapPin size={16} />
              {unit.project_name || 'Your Project'} {unit.block_name ? `• ${unit.block_name}` : ''} {unit.floor_name ? `• ${unit.floor_name}` : ''}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 text-center min-w-[140px]">
             <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
             <div className="font-bold text-slate-800">{friendlyStatus(unit.status)}</div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Specifications & Actions */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Property Details */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                    <Maximize size={24} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-500">Area</div>
                    <div className="text-[16px] font-bold text-slate-900">{unit.area || 'N/A'} {unit.area ? 'sq.ft' : ''}</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                    <BedDouble size={24} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-500">Bedrooms</div>
                    <div className="text-[16px] font-bold text-slate-900">{unit.bedrooms || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                    <Bath size={24} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-500">Bathrooms</div>
                    <div className="text-[16px] font-bold text-slate-900">{unit.bathrooms || 'N/A'}</div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/admin/customer-documents')}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all h-full group text-left"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">View Documents</h3>
                  <p className="text-sm text-slate-500 m-0">Access property documents and agreements</p>
                </button>
                
                <button 
                  onClick={() => navigate('/admin/customer-issues')}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-red-300 hover:shadow-sm transition-all h-full group text-left"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                      <Wrench size={20} />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-red-500 transition-colors">Report an Issue</h3>
                  <p className="text-sm text-slate-500 m-0">Log defects or maintenance requests</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Progress Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Your Progress</h3>

              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center pb-5 border-b border-slate-100">
                  <span className="text-[14px] font-semibold text-slate-600 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <FileText size={16} />
                    </div>
                    Documents
                  </span>
                  <span className={`text-[13px] font-bold ${unit.docsCleared ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {unit.docsCleared ? 'Approved' : 'Under Review'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-5 border-b border-slate-100">
                  <span className="text-[14px] font-semibold text-slate-600 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Activity size={16} />
                    </div>
                    Quality Check
                  </span>
                  <span className={`text-[13px] font-bold ${unit.inspectionStatus === 'Passed' ? 'text-emerald-500' : (unit.inspectionStatus === 'Failed' ? 'text-red-500' : 'text-amber-500')}`}>
                    {friendlyStatus(unit.inspectionStatus)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-semibold text-slate-600 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Building2 size={16} />
                    </div>
                    Handover
                  </span>
                  <span className={`text-[13px] font-bold ${unit.status === 'handed_over' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {unit.status === 'handed_over' ? 'Completed' : 'Not Yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
