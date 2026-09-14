import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Play, Pause, Plus, Search, AlertCircle, Check, X, Building2, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { buildersApi } from '../../api/services';
import { Builder } from '../../types';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isSuspended = status === 'Suspended';
  const isPending = status === 'Pending';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
      ${isSuspended ? 'bg-red-50 text-red-700 border-red-200' : isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSuspended ? 'bg-red-600' : isPending ? 'bg-amber-500' : 'bg-emerald-600'}`} />
      {status}
    </span>
  );
};

const STATUS_FILTERS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

const BuildersList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);
  const [modalAction, setModalAction] = useState<'suspend' | 'activate' | 'approve' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search + filter state
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (search?: string, status?: string) => {
    try {
      setLoading(true);
      const builders = await buildersApi.getBuilders({
        search: search || undefined,
        status: status || undefined,
      });
      setData(builders);
    } catch (error) {
      console.error('Failed to fetch builders', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchData(value, statusFilter);
    }, 400);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setShowStatusDropdown(false);
    fetchData(searchInput, value);
  };

  const handleAction = (builder: Builder, action: 'view' | 'edit' | 'suspend' | 'activate' | 'approve') => {
    if (action === 'view') {
      navigate(`/admin/builders/${builder.id}`);
    } else if (action === 'edit') {
      navigate(`/admin/builders/${builder.id}?edit=true`);
    } else {
      setSelectedBuilder(builder);
      setModalAction(action);
      setIsModalOpen(true);
    }
  };

  const confirmAction = async () => {
    if (selectedBuilder && modalAction) {
      setIsSubmitting(true);
      try {
        if (modalAction === 'suspend') {
          await buildersApi.suspendBuilder(selectedBuilder.id);
        } else if (modalAction === 'approve') {
          await buildersApi.approveBuilder(selectedBuilder.id);
        } else if (modalAction === 'activate') {
          await buildersApi.activateBuilder(selectedBuilder.id);
        }
        await fetchData(searchInput, statusFilter);
      } catch (error) {
        console.error('Failed to update builder status', error);
      } finally {
        setIsSubmitting(false);
        setIsModalOpen(false);
      }
    }
  };

  const activeFilterLabel = STATUS_FILTERS.find(f => f.value === statusFilter)?.label || 'All Status';

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Builders Directory
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Manage organizations using the Handoverly platform.
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin/builders/new')}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} className="mr-1.5" strokeWidth={2.5} />
            Add Builder
          </button>
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Table Header/Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by company, email, or contact..." 
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors shadow-sm"
              />
              {searchInput && (
                <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md bg-white text-[13px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span>{activeFilterLabel}</span>
                <ChevronDown size={14} />
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => handleStatusFilter(f.value)}
                      className={`w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 transition-colors ${statusFilter === f.value ? 'text-[#2563EB] font-semibold' : 'text-slate-700'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Projects</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map(record => {
                    const items: DropdownItem[] = [
                      { key: '1', label: 'View Details', icon: <Eye size={14} />, onClick: () => handleAction(record, 'view') },
                      { key: '2', label: 'Edit Profile', icon: <Edit2 size={14} />, onClick: () => handleAction(record, 'edit') },
                      { key: 'div', label: '', divider: true },
                    ];
                    
                    if (record.status === 'Active') {
                      items.push({ 
                        key: '3', 
                        label: 'Suspend Account', 
                        icon: <Pause size={14} />, 
                        danger: true, 
                        onClick: () => handleAction(record, 'suspend') 
                      });
                    } else if (record.status === 'Pending') {
                      items.push({ 
                        key: '3', 
                        label: 'Approve Account', 
                        icon: <Check size={14} />, 
                        onClick: () => handleAction(record, 'approve') 
                      });
                    } else if (record.status === 'Suspended') {
                      items.push({ 
                        key: '3', 
                        label: 'Activate Account', 
                        icon: <Play size={14} />, 
                        onClick: () => handleAction(record, 'activate') 
                      });
                    }

                    const joinedDate = record.joined
                      ? new Date(record.joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—';

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                              <Building2 size={14} />
                            </div>
                            <div>
                              <div className="font-semibold text-[#0F172A] text-[13px]">{record.name}</div>
                              <div className="text-[11px] text-slate-400">{record.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-[13px]">
                          <div>{record.contact}</div>
                          {record.phone && <div className="text-[11px] text-slate-400">{record.phone}</div>}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[12px] border border-slate-200">
                            {record.project_count ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {record.plan ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[12px] border border-blue-100">
                              {record.plan}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[12px] italic">No plan</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-[13px]">
                          {joinedDate}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Dropdown items={items} />
                        </td>
                      </tr>
                    );
                  })}
                  {data.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle className="w-8 h-8 mb-3 opacity-40" />
                          <p className="font-medium text-[#0F172A]">
                            {searchInput || statusFilter ? 'No builders match your filters' : 'No builders found'}
                          </p>
                          <p className="text-sm mt-1">
                            {searchInput || statusFilter ? 'Try adjusting your search or filters.' : 'Get started by adding a new builder company.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      <Modal
        title={
          modalAction === 'suspend' ? 'Suspend Builder Account' 
          : modalAction === 'approve' ? 'Approve Builder Account' 
          : 'Activate Builder Account'
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant={modalAction === 'suspend' ? 'danger' : 'primary'} onClick={confirmAction} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' 
                : modalAction === 'suspend' ? 'Suspend Account' 
                : modalAction === 'approve' ? 'Approve Account' 
                : 'Activate Account'}
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-slate-600 leading-relaxed">
          {modalAction === 'suspend' 
            ? `Are you sure you want to suspend ${selectedBuilder?.name}? This will prevent all their users from accessing Handoverly.` 
            : modalAction === 'approve' 
            ? `Are you sure you want to approve ${selectedBuilder?.name}? This will grant them full access to the platform.`
            : `Are you sure you want to activate ${selectedBuilder?.name}? They will regain full access to the platform.`}
        </p>
      </Modal>
    </div>
  );
};

export default BuildersList;
