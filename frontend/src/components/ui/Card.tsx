import React from 'react';

interface CardComponentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardComponentProps> = ({ children, className = '', style }) => (
  <div className={`ui-card ${className}`} style={style}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardComponentProps> = ({ children, className = '', style }) => (
  <div className={`ui-card-header ${className}`} style={style}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardComponentProps> = ({ children, className = '', style }) => (
  <h3 className={`ui-card-title ${className}`} style={style}>
    {children}
  </h3>
);

export const CardBody: React.FC<CardComponentProps> = ({ children, className = '', style }) => (
  <div className={`ui-card-body ${className}`} style={style}>
    {children}
  </div>
);
