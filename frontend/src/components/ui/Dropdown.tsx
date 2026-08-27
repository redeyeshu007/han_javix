import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

export const Dropdown: React.FC<{ items: DropdownItem[]; children?: React.ReactNode }> = ({ items, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {children || (
          <button className="btn-ghost" style={{ padding: '6px' }}>
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          marginTop: '4px',
          width: '200px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--admin-border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 50,
          padding: '4px 0'
        }}>
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} style={{ height: '1px', backgroundColor: 'var(--admin-border)', margin: '4px 0' }} />;
            }
            return (
              <button
                key={item.key}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: item.danger ? '#DC2626' : 'var(--admin-text-primary)',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
