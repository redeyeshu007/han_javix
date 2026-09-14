import React, { useState, useEffect } from 'react';
import { Camera, Plus, CheckCircle2, AlertTriangle, CheckSquare, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, defectsApi, auditService } from '../../api/services';
import { User } from '../../types/models';
import { UnitWorkspace } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerInspection: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<UnitWorkspace | null>(null);
  
  const [isLoggingIssue, setIsLoggingIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!user?.unitId) {
        setLoading(false);
        return;
      }
      try {
        const data = await unitsApi.getWorkspace(user.unitId);
        setWorkspace(data);
      } catch (error) {
        console.error('Error fetching inspection data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInspectionData();
  }, [user]);

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.unit || !issueTitle || !issueLocation || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { unit, customer, project } = workspace;
      const customerId = customer?.id || '';

      if (unit.status === 'handed_over') {
        const { serviceRequestsApi } = await import('../../api/services');
        await serviceRequestsApi.createRequest({
          unitId: unit.id,
          customerId,
          request: `${issueTitle} - ${issueLocation}\n\n${issueDescription}`
        });
        await auditService.createAuditLog({
          projectId: project?.id || '',
          unitId: unit.id,
          action: 'Warranty Request Logged',
          actor: 'Customer',
          details: `Customer logged a warranty request: ${issueTitle}`
        });
      } else {
        await defectsApi.createDefect({
          builderId: '',
          projectId: project?.id || '',
          unitId: unit.id,
          title: issueTitle,
          location: issueLocation,
          description: issueDescription,
          severity: 'medium',
          contractorId: '',
          evidence: []
        });
        await auditService.createAuditLog({
          projectId: project?.id || '',
          unitId: unit.id,
          action: 'Defect Logged',
          actor: 'Customer',
          details: `Customer logged an issue: ${issueTitle}`
        });
      }
      
      setSuccessMsg('Request logged successfully. Our team will review it shortly.');
      setIsLoggingIssue(false);
      setIssueTitle('');
      setIssueLocation('');
      setIssueDescription('');
      
      // Refresh workspace counts
      const newData = await unitsApi.getWorkspace(unit.id, true);
      setWorkspace(newData);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Error submitting issue', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;
  
  if (!workspace?.unit) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 bg-[#F8FAFC]">
        <Activity size={64} className="opacity-20 mb-6" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Inspection Data</h3>
        <p className="text-slate-500">You have not been assigned to a property yet.</p>
      </div>
    );
  }

  const { unit, latestInspection } = workspace;

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2">
              {unit.status === 'handed_over' ? 'Warranty & Care' : 'Quality Check'}
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              {unit.status === 'handed_over' ? 'Request warranty service for your home.' : 'Review your home and report anything you notice during your visit.'}
            </p>
          </div>
          
          {!isLoggingIssue && (
            <button 
              onClick={() => setIsLoggingIssue(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border-none font-semibold text-[15px] flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={18} /> {unit.status === 'handed_over' ? 'Request Service' : 'Report Issue'}
            </button>
          )}
        </section>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 font-medium shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-500" /> {successMsg}
          </div>
        )}

        {isLoggingIssue ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{unit.status === 'handed_over' ? 'Request Service' : 'Report an Issue'}</h2>
            <form onSubmit={handleSubmitIssue}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Issue Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Broken tile, Paint chip" 
                    value={issueTitle}
                    onChange={e => setIssueTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Exact Location *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Master Bedroom, Kitchen Counter" 
                    value={issueLocation}
                    onChange={e => setIssueLocation(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
                <textarea 
                  rows={4}
                  placeholder="Provide more details about the issue..."
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Photo Evidence</label>
                <div className="border-2 border-dashed border-slate-300 p-8 text-center rounded-2xl text-slate-500 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-200">
                    <Camera size={24} className="text-blue-500" />
                  </div>
                  <div className="text-slate-900 font-semibold text-[15px]">Click to upload photos</div>
                  <div className="text-sm mt-1 text-slate-500">JPG, PNG up to 10MB</div>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsLoggingIssue(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[15px] hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl border-none bg-slate-900 text-white font-semibold text-[15px] flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 m-0">Self-Guided Tour</h2>
                  <p className="mt-1 text-slate-500 text-sm">Walk through your property and verify these common areas.</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <CheckSquare size={24} className="text-blue-500" />
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {['Main Entrance & Door', 'Living Room Walls & Paint', 'Kitchen Cabinetry & Plumbing', 'Master Bedroom & Wardrobes', 'Bathrooms & Fittings', 'Electrical Switches & Points'].map((area, idx, arr) => (
                  <div key={idx} className={`p-5 px-6 flex items-center justify-between transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-100' : ''} ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <div className="font-semibold text-slate-800 text-[14px]">{area}</div>
                    <button 
                      onClick={() => {
                        setIssueLocation(area);
                        setIsLoggingIssue(true);
                      }}
                      className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold text-[13px] flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <AlertTriangle size={14} className="text-amber-500" /> Report Issue
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Where You Stand</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Quality Check</span>
                    <span className={`px-2.5 py-1 rounded-md text-[12px] font-semibold ${latestInspection?.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                      {latestInspection?.status === 'completed' ? 'Passed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">Next Up</span>
                    <span className="text-[13px] font-semibold text-slate-800">Handover</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInspection;
