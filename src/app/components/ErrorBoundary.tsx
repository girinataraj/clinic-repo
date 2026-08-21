import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 shadow-sm my-4 font-sans text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h4 className="text-base font-extrabold mb-1">
            {this.props.fallbackMessage || 'Something went wrong loading this report view.'}
          </h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-4 max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw size={14} /> Retry View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
