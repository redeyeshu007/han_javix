import React from 'react';

export interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseInputProps {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <span className="absolute left-3 text-slate-400 flex items-center">{leftIcon}</span>}
          <input 
            ref={ref} 
            className={`w-full px-4 py-2.5 bg-white border rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 transition-colors shadow-sm
              ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-[#2563EB]/20 focus:border-[#2563EB]'}
            `} 
            style={{ 
              paddingLeft: leftIcon ? '40px' : undefined,
              paddingRight: rightIcon ? '40px' : undefined
            }}
            {...props} 
          />
          {rightIcon && <span className="absolute right-3 text-slate-400 flex items-center">{rightIcon}</span>}
        </div>
        {error && <div className="text-[12px] font-medium text-red-500">{error}</div>}
        {helperText && !error && <div className="text-[12px] text-slate-500">{helperText}</div>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea 
          ref={ref} 
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 transition-colors shadow-sm
            ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-[#2563EB]/20 focus:border-[#2563EB]'}
          `} 
          {...props} 
        />
        {error && <div className="text-[12px] font-medium text-red-500">{error}</div>}
        {helperText && !error && <div className="text-[12px] text-slate-500">{helperText}</div>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  options?: { value: string; label: string }[];
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = '', options, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select 
          ref={ref} 
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 transition-colors shadow-sm appearance-none
            ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-200 focus:ring-[#2563EB]/20 focus:border-[#2563EB]'}
          `} 
          {...props}
        >
          {options ? options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>) : props.children}
        </select>
        {error && <div className="text-[12px] font-medium text-red-500">{error}</div>}
        {helperText && !error && <div className="text-[12px] text-slate-500">{helperText}</div>}
      </div>
    );
  }
);
Select.displayName = 'Select';
