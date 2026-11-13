import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    if (import.meta.env.VITE_SENTRY_DSN) {
      void import('../../lib/sentry').then(({ Sentry }) => {
        Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fffbef] text-[#183c3a] flex items-center justify-center p-6 font-['Manrope',sans-serif]" data-testid="error-boundary-page">
          <div className="bg-white p-8 rounded-3xl border border-[#e4dfd2] max-w-md w-full shadow-sm text-center">
            <div className="w-12 h-12 bg-[#fbeee9] text-[#ae4d45] border border-[#e98b70]/40 rounded-full flex items-center justify-center mx-auto mb-4 font-extrabold text-xl">
              !
            </div>
            <h1 className="text-xl font-extrabold text-[#183c3a] mb-2" data-testid="error-boundary-title">
              Ha ocurrido un error inesperado
            </h1>
            <p className="text-sm text-[#607674] mb-6 leading-relaxed" data-testid="error-boundary-message">
              Ocurrió una excepción durante la renderización de la interfaz. Por favor, reintente o vuelva al inicio.
            </p>
            <button
              type="button"
              data-testid="error-boundary-retry-button"
              onClick={this.handleRetry}
              className="w-full py-3 px-6 bg-[#609f9c] hover:bg-[#4d8d89] text-white rounded-full text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
