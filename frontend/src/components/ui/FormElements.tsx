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
      <div className={`ui-form-group ${className}`}>
        {label && <label className="ui-label">{label} {props.required && <span style={{color: 'red'}}>*</span>}</label>}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && <span style={{ position: 'absolute', left: '12px', display: 'flex', color: '#64748b' }}>{leftIcon}</span>}
          <input 
            ref={ref} 
            className={`ui-input ${error ? 'error' : ''}`} 
            style={{ 
              paddingLeft: leftIcon ? '40px' : undefined,
              paddingRight: rightIcon ? '40px' : undefined
            }}
            {...props} 
          />
          {rightIcon && <span style={{ position: 'absolute', right: '12px', display: 'flex', color: '#64748b' }}>{rightIcon}</span>}
        </div>
        {error && <div className="ui-error-text">{error}</div>}
        {helperText && !error && <div className="ui-helper-text">{helperText}</div>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className={`ui-form-group ${className}`}>
        {label && <label className="ui-label">{label} {props.required && <span style={{color: 'red'}}>*</span>}</label>}
        <textarea ref={ref} className={`ui-textarea ${error ? 'error' : ''}`} {...props} />
        {error && <div className="ui-error-text">{error}</div>}
        {helperText && !error && <div className="ui-helper-text">{helperText}</div>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  options: { value: string; label: string }[];
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = '', options, ...props }, ref) => {
    return (
      <div className={`ui-form-group ${className}`}>
        {label && <label className="ui-label">{label} {props.required && <span style={{color: 'red'}}>*</span>}</label>}
        <select ref={ref} className={`ui-select ${error ? 'error' : ''}`} {...props}>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <div className="ui-error-text">{error}</div>}
        {helperText && !error && <div className="ui-helper-text">{helperText}</div>}
      </div>
    );
  }
);
Select.displayName = 'Select';
