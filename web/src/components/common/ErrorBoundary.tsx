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
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" data-testid="error-boundary-page">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-lg text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-2" data-testid="error-boundary-title">
              Ha ocurrido un error inesperado
            </h1>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed" data-testid="error-boundary-message">
              Ocurrió una excepción durante la renderización de la interfaz. Por favor, reintente o vuelva al inicio.
            </p>
            <button
              data-testid="error-boundary-retry-button"
              onClick={this.handleRetry}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold shadow transition"
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
