import * as React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, Bug } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by React ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Runtime Protection Active
                </span>
                <h1 className="text-xl font-black text-white mt-1">Application Recovered From Exception</h1>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              An unhandled UI error occurred. The system safely intercepted the crash to protect your site inputs and session data.
            </p>

            {this.state.error && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-red-400">
                  <span className="flex items-center gap-1.5">
                    <Bug className="w-4 h-4 text-red-400" /> Error Details
                  </span>
                  <span>{this.state.error.name}</span>
                </div>
                <p className="text-xs font-mono text-slate-300 break-words font-semibold">
                  {this.state.error.message || 'Unknown Exception'}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2 text-[10px] font-mono text-slate-400 cursor-pointer">
                    <summary className="hover:text-slate-200 transition">View Component Call Stack</summary>
                    <pre className="mt-2 p-2 bg-slate-900 rounded-xl overflow-x-auto text-[10px] text-slate-400 max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>

              <button
                onClick={this.handleResetState}
                className="w-full sm:w-auto flex-1 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Reset Local Cache & Return Home
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" /> 2CLICK.IN Self-Healing Engine
              </span>
              <span>IS 456 / CPWD Compliant</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
