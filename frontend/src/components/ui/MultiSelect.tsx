import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

export interface MultiSelectOption {
  id: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  required?: boolean;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  emptyMessage?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  required,
  options,
  value,
  onChange,
  placeholder = 'Select projects',
  error,
  emptyMessage = 'No projects available.'
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOptions = options.filter(o => value.includes(o.id));
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  const toggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const removeOption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  return (
    <div className="ui-form-group" ref={containerRef} style={{ position: 'relative' }}>
      {label && <label className="ui-label">{label} {required && <span style={{ color: 'red' }}>*</span>}</label>}

      <div
        className={`ui-input ${error ? 'error' : ''}`}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: 'pointer',
          minHeight: '42px',
          height: 'auto',
          padding: '6px 12px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
          {selectedOptions.length === 0 && (
            <span style={{ color: '#94A3B8', fontSize: '14px' }}>{placeholder}</span>
          )}
          {selectedOptions.map(opt => (
            <span
              key={opt.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                padding: '2px 6px 2px 8px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {opt.label}
              <X size={12} style={{ cursor: 'pointer' }} onClick={(e) => removeOption(opt.id, e)} />
            </span>
          ))}
        </div>
        <ChevronDown size={16} color="#64748B" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid var(--admin-border, #DCE7F5)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(7, 26, 51, 0.12)',
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderBottom: '1px solid #EEF2F7' }}>
            <Search size={14} color="#94A3B8" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects..."
              style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '16px', fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>{emptyMessage}</div>
            ) : (
              filteredOptions.map(opt => {
                const checked = value.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      backgroundColor: checked ? '#F0F7FF' : 'transparent'
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = checked ? '#F0F7FF' : 'transparent')}
                  >
                    <input type="checkbox" checked={checked} readOnly style={{ pointerEvents: 'none' }} />
                    <span style={{ color: '#1E293B' }}>{opt.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <div className="ui-error-text">{error}</div>}
    </div>
  );
};

export default MultiSelect;
