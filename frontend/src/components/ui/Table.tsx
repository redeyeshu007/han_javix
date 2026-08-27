import React from 'react';

export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`ui-table-container ${className}`}>
    {children}
  </div>
);

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <table className={`ui-table ${className}`}>
    {children}
  </table>
);
