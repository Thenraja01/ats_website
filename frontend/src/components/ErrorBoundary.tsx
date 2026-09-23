import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React boundary error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 text-white font-sans relative overflow-hidden">
          {/* Neon Glow Accents */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-md w-full glass rounded-3xl p-8 border border-white/[0.08] text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8 text-red-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-heading text-white">Something went wrong</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                An unexpected system runtime error occurred. Our engineers have been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Diagnostic Log</p>
                <p className="text-xs text-red-300 font-mono break-all line-clamp-3">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/45 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
