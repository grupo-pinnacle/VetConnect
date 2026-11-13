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
    success: 'bg-[#edf6f4] text-[#183c3a] border border-[#609f9c]/35',
    green: 'bg-[#edf6f4] text-[#183c3a] border border-[#609f9c]/35',
    verde: 'bg-[#edf6f4] text-[#183c3a] border border-[#609f9c]/35',
    warning: 'bg-[#f8f0dc] text-[#7a5813] border border-[#d6b66f]/60',
    yellow: 'bg-[#f8f0dc] text-[#7a5813] border border-[#d6b66f]/60',
    amarillo: 'bg-[#f8f0dc] text-[#7a5813] border border-[#d6b66f]/60',
    danger: 'bg-[#fbeee9] text-[#ae4d45] border border-[#e98b70]/60',
    red: 'bg-[#fbeee9] text-[#ae4d45] border border-[#e98b70]/60',
    rojo: 'bg-[#fbeee9] text-[#ae4d45] border border-[#e98b70]/60',
    online: 'bg-[#d9e8e4] text-[#183c3a] border border-[#609f9c]/45',
    offline: 'bg-[#f2eddd] text-[#454e4e] border border-[#e4dfd2]',
    neutral: 'bg-[#f2eddd] text-[#454e4e] border border-[#e4dfd2]',
    info: 'bg-[#d9e8e4]/70 text-[#315f5d] border border-[#609f9c]/30',
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
