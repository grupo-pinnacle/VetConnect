import React, { useState } from 'react';
import { AvatarProps } from '../../types';

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  status,
  className = '',
  'data-testid': testId,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  const statusSizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white',
    busy: 'bg-amber-500 ring-white',
    offline: 'bg-slate-400 ring-white',
  };

  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      data-testid={testId}
      className={`relative inline-block shrink-0 ${sizeStyles[size]} ${className}`}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full rounded-full object-cover border border-slate-200"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-sky-100 text-sky-800 font-semibold flex items-center justify-center border border-sky-200">
          {initials || '🐾'}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ${statusSizeStyles[size]} ${statusColors[status]}`}
          aria-label={`Estado: ${status}`}
        />
      )}
    </div>
  );
};
