import React from 'react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { inputCls, labelCls } from './shared';
import { ButtonLoading } from '../../../components/LoadingState';

export interface CustomerModalsProps {
  customerPassword: any;
  setShowConfirmPassword: any;
  assignErrors: any;
  customerName: any;
  confirmCustomerPassword: any;
  showUnassignConfirm: any;
  isSubmitting: any;
  customerEmail: any;
  setCustomerPhone: any;
  setShowPassword: any;
  showConfirmPassword: any;
  handleAssignCustomer: any;
  setShowAssignCustomer: any;
  showPassword: any;
  unassignError: any;
  setCustomerPassword: any;
  customerPhone: any;
  showAssignCustomer: any;
  handleUnassignCustomer: any;
  customer: any;
  unit: any;
  setConfirmCustomerPassword: any;
  setCustomerName: any;
  setCustomerEmail: any;
  setShowUnassignConfirm: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) — pure move,
 * identical JSX and behavior.
 */
export function CustomerModals({customerPassword, setShowConfirmPassword, assignErrors, customerName, confirmCustomerPassword, showUnassignConfirm, isSubmitting, customerEmail, setCustomerPhone, setShowPassword, showConfirmPassword, handleAssignCustomer, setShowAssignCustomer, showPassword, unassignError, setCustomerPassword, customerPhone, showAssignCustomer, handleUnassignCustomer, customer, unit, setConfirmCustomerPassword, setCustomerName, setCustomerEmail, setShowUnassignConfirm}: CustomerModalsProps) {
  return (
    <>
      {/* 1. Assign Customer Modal */}
      {showAssignCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Assign Buyer to {unit.name}</h3>
              <button
                type="button"
                onClick={() => setShowAssignCustomer(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignCustomer} className="space-y-4">
              {assignErrors.form && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{assignErrors.form}</span>
                </div>
              )}
              <div>
                <label className={labelCls}>Customer Name *</label>
                <input
                  type="text"
                  className={inputCls(Boolean(assignErrors.customerName))}
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className={labelCls}>Email Address *</label>
                <input
                  type="email"
                  className={inputCls(Boolean(assignErrors.customerEmail))}
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="e.g. john@doe.com"
                />
                {assignErrors.customerEmail && (
                  <p className="text-red-500 text-xs mt-1">{assignErrors.customerEmail}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Phone Number *</label>
                <input
                  type="tel"
                  className={inputCls(Boolean(assignErrors.customerPhone))}
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={inputCls(Boolean(assignErrors.customerPassword))}
                      value={customerPassword}
                      onChange={e => setCustomerPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {assignErrors.customerPassword && (
                    <p className="text-red-500 text-xs mt-1">{assignErrors.customerPassword}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Required for a new account. Leave blank to link an existing customer with this email.
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={inputCls(Boolean(assignErrors.confirmCustomerPassword))}
                      value={confirmCustomerPassword}
                      onChange={e => setConfirmCustomerPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {assignErrors.confirmCustomerPassword && (
                    <p className="text-red-500 text-xs mt-1">{assignErrors.confirmCustomerPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignCustomer(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all"
                >
                  {isSubmitting ? <ButtonLoading label="Allocating..." /> : 'Allocate Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1b. Unassign Customer Confirmation */}
      {showUnassignConfirm && customer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Unassign Buyer</h3>
              <button
                type="button"
                onClick={() => setShowUnassignConfirm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[14px] text-slate-600 mb-2">
              Remove <strong className="text-[#0F172A]">{customer.name}</strong> from unit{' '}
              <strong className="text-[#0F172A]">{unit.name}</strong>?
            </p>
            <p className="text-[13px] text-slate-500 mb-6">
              The customer account is kept — only the link to this unit is released. The account can be re-allocated later.
            </p>
            {unassignError && (
              <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{unassignError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUnassignConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnassignCustomer}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold shadow-sm transition-all"
              >
                {isSubmitting ? <ButtonLoading label="Releasing..." /> : 'Unassign Buyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
