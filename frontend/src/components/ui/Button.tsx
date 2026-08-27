import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    
    // I am relying on the existing index.css and some utility classes if tailwind is present, 
    // but looking at index.css, Tailwind is not explicitly included. I will use standard class names and define them in admin.css.
    
    const baseClass = `btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`;

    return (
      <button
        ref={ref}
        className={baseClass}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="btn-spinner" size={16} />}
        {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
