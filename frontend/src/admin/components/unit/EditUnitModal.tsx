import React from 'react';
import { X } from 'lucide-react';
import { inputCls, labelCls } from './shared';
import { ButtonLoading } from '../../../components/LoadingState';
import { unitsApi } from '../../../api/services';

export interface EditUnitModalProps {
  editFloors: any;
  showEditUnit: any;
  setEditUnitForm: any;
  setEditFloors: any;
  isSubmitting: any;
  handleEditUnitSubmit: any;
  blocks: any;
  setShowEditUnit: any;
  editUnitForm: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) — pure move,
 * identical JSX and behavior.
 */
export function EditUnitModal({editFloors, showEditUnit, setEditUnitForm, setEditFloors, isSubmitting, handleEditUnitSubmit, blocks, setShowEditUnit, editUnitForm}: EditUnitModalProps) {
  return (
    <>
      {/* 5. Edit Unit Modal */}
      {showEditUnit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[20px] font-bold text-[#0F172A]">Edit Unit Details</h2>
              <button
                type="button"
                onClick={() => setShowEditUnit(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditUnitSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Unit Name *</label>
                  <input
                    type="text"
                    className={inputCls()}
                    value={editUnitForm.name}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Current Status *</label>
                  <select
                    className={inputCls()}
                    value={editUnitForm.status}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, status: e.target.value })}
                    required
                  >
                    {/* Values must match the backend Unit.UNIT_STATUS_CHOICES,
                        otherwise the PATCH is rejected with 400. */}
                    <option value="not_started">Not Started</option>
                    <option value="construction_in_progress">Construction in Progress</option>
                    <option value="internal_inspection">Internal Inspection</option>
                    <option value="defect_resolution">Defect Resolution</option>
                    <option value="nearing_completion">Nearing Completion</option>
                    <option value="ready_for_handover">Ready for Handover</option>
                    <option value="handed_over">Handed Over</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Block *</label>
                  <select
                    className={inputCls()}
                    value={editUnitForm.blockId}
                    onChange={(e) => {
                      const newBlockId = e.target.value;
                      setEditUnitForm({ ...editUnitForm, blockId: newBlockId, floorId: '' });
                      // Fetch the newly selected block's floors from the API
                      if (newBlockId) {
                        unitsApi.getFloors(newBlockId)
                          .then((list: any) => setEditFloors(list))
                          .catch(err => console.warn('Could not load floors for block', err));
                      } else {
                        setEditFloors([]);
                      }
                    }}
                    required
                  >
                    <option value="">Select Block</option>
                    {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Floor *</label>
                  <select
                    className={inputCls()}
                    value={editUnitForm.floorId}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, floorId: e.target.value })}
                    required
                    disabled={!editUnitForm.blockId}
                  >
                    <option value="">Select Floor</option>
                    {editFloors.filter(f => String(f.blockId) === String(editUnitForm.blockId)).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Unit Type</label>
                  <input
                    type="text"
                    className={inputCls()}
                    placeholder="e.g. 2 BHK Apartment"
                    value={editUnitForm.type}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Area (sq ft)</label>
                  <input
                    type="number"
                    className={inputCls()}
                    value={editUnitForm.areaSqFt}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, areaSqFt: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Bedrooms</label>
                  <input
                    type="number"
                    className={inputCls()}
                    value={editUnitForm.bedrooms}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, bedrooms: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Bathrooms</label>
                  <input
                    type="number"
                    className={inputCls()}
                    value={editUnitForm.bathrooms}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, bathrooms: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditUnit(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all"
                >
                  {isSubmitting ? <ButtonLoading label="Saving..." /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
