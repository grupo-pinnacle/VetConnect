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
          className="block text-sm font-medium text-slate-700 mb-1"
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
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          error
            ? 'border-red-500 focus:border-red-600 focus:ring-red-100'
            : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 mt-1 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
