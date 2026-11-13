import React from 'react';
import { InputProps } from '../../types';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  'data-testid': testId,
  disabled,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-[#183c3a] mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        data-testid={testId}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-[#183c3a] transition-colors focus:outline-none focus:ring-2 disabled:bg-[#f2eddd]/60 disabled:text-[#607674] disabled:cursor-not-allowed ${
          error
            ? 'border-[#ae4d45] focus:border-[#ae4d45] focus:ring-[#ae4d45]/15'
            : 'border-[#183c3a]/20 focus:border-[#609f9c] focus:ring-[#609f9c]/20'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[#ae4d45] mt-1 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-[#607674] mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
