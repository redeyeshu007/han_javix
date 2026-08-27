import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Something went wrong.', onRetry }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px',
      color: '#DC2626',
      border: '1px solid #FCA5A5',
      borderRadius: '12px',
      backgroundColor: '#FEF2F2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}>
      <AlertTriangle size={32} style={{ marginBottom: '16px' }} />
      <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>
        Unable to load data
      </h4>
      <p style={{ fontSize: '13px', margin: '0 0 24px 0', maxWidth: '300px', color: '#991B1B' }}>
        {message}
      </p>
      {onRetry && (
        <button 
          className="btn-secondary" 
          onClick={onRetry}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', borderColor: '#FCA5A5' }}
        >
          <RefreshCcw size={14} /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
