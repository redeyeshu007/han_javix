import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Archive, RotateCcw, Search, ClipboardCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { checklistsApi } from '../../api/services';
import { ChecklistTemplate } from '../../types';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status === 'Active';
  const isDraft = status === 'Draft';
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wider
      ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
      : isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' 
      : 'bg-slate-50 text-slate-600 border-slate-200'}
    `}>
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>}
      {isDraft && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
      {!isActive && !isDraft && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>}
      {status}
    </span>
  );
};

const Checklists: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChecklistTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistTemplate | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setData(await checklistsApi.getChecklists());
    } catch (error) {
      console.error('Failed to fetch checklists', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (checklist?: ChecklistTemplate) => {
    if (checklist) {
      setEditingChecklist(checklist);
      setName(checklist.name);
      setCategory(checklist.category);
      setDescription(checklist.description || '');
      setStatus(checklist.status);
    } else {
      setEditingChecklist(null);
      setName('');
      setCategory('Plumbing');
      setDescription('');
      setStatus('Active');
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!category.trim()) newErrors.category = 'Required';
    if (!status.trim()) newErrors.status = 'Required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (editingChecklist) {
        await checklistsApi.updateChecklist(editingChecklist.id, { name, category, description, status });
      } else {
        await checklistsApi.createChecklist({ name, category, description, status } as any);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save checklist', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async (checklist: ChecklistTemplate) => {
    const newStatus = checklist.status === 'Archived' ? 'Active' : 'Archived';
    try {
      await checklistsApi.updateChecklist(checklist.id, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error('Failed to update checklist status', error);
    }
  };

  if (loading) return <PageLoading />;

  const filteredData = data.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1 relative z-0">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Standard Checklists
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Manage reusable inspection checklists across the platform.
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} className="mr-1.5" strokeWidth={2.5} />
            New Checklist
          </button>
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Table Header/Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search checklists..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Checklist Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[#0F172A] text-[13px]">{record.name}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-slate-600 font-medium text-[13px]">{record.category}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[12px] border border-slate-200">
                        {record.items}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-[13px]">
                      {record.updated}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(record)}
                          className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-[#2563EB]/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {record.status === 'Archived' ? (
                          <button 
                            onClick={() => handleArchiveToggle(record)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Restore"
                          >
                            <RotateCcw size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleArchiveToggle(record)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <ClipboardCheck className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No checklists found</p>
                        <p className="text-sm mt-1">Get started by creating a new checklist template.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Modal
        title={editingChecklist ? 'Edit Checklist' : 'Create New Checklist'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>
              {editingChecklist ? 'Save Changes' : 'Create Checklist'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pt-4">
          <Input label="Checklist Name" required error={errors.name} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pre-Handover Quality Check" />
          <Select
            label="Category"
            required
            error={errors.category}
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={[
              { value: 'Plumbing', label: 'Plumbing' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Civil', label: 'Civil' },
              { value: 'Carpentry', label: 'Carpentry' },
              { value: 'General', label: 'General' }
            ]}
          />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description of this checklist's purpose..." />
          <Select
            label="Status"
            required
            error={errors.status}
            value={status}
            onChange={e => setStatus(e.target.value as 'Active' | 'Draft' | 'Archived')}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Archived', label: 'Archived' }
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Checklists;
