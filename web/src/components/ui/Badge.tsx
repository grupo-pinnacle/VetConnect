import React from 'react';
import { BadgeProps } from '../../types';

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  icon,
  className = '',
  'data-testid': testId,
}) => {
  const variantStyles: Record<BadgeProps['variant'], string> = {
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    green: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    verde: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    yellow: 'bg-amber-100 text-amber-800 border border-amber-200',
    amarillo: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200 animate-pulse',
    red: 'bg-red-100 text-red-800 border border-red-200 animate-pulse',
    rojo: 'bg-red-100 text-red-800 border border-red-200 animate-pulse',
    online: 'bg-teal-100 text-teal-800 border border-teal-200',
    offline: 'bg-slate-100 text-slate-700 border border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    info: 'bg-sky-100 text-sky-800 border border-sky-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="inline-block shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
