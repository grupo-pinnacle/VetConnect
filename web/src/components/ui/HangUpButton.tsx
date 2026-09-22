import React from 'react';
import { HangUpButtonProps } from '../../types';

export const HangUpButton: React.FC<HangUpButtonProps> = ({
  onHangUp,
  isLoading = false,
  className = '',
  'data-testid': testId,
}) => {
  return (
    <button
      type="button"
      data-testid={testId || 'hang-up-btn'}
      disabled={isLoading}
      onClick={onHangUp}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-semibold rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
        />
      </svg>
      {isLoading ? 'Finalizando...' : 'Finalizar Consulta'}
    </button>
  );
};
