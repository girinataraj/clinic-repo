import { AlertTriangle, RefreshCw, ShieldX, ServerCrash, WifiOff } from 'lucide-react';

interface Props {
  /** The error from React Query or a caught exception */
  error: unknown;
  /** Optional retry callback (e.g. refetch from React Query) */
  onRetry?: () => void;
  /** Additional CSS class */
  className?: string;
}

function getErrorInfo(error: unknown): { message: string; icon: React.ReactNode } {
  const status = (error as any)?.response?.status;
  const serverMsg = (error as any)?.response?.data?.message;

  if (!navigator.onLine || (error as any)?.code === 'ERR_NETWORK') {
    return {
      message: 'No internet connection. Check your network and try again.',
      icon: <WifiOff className="w-5 h-5 text-slate-500" />,
    };
  }

  if (status === 403) {
    return {
      message: 'Access denied. You do not have permission to view this.',
      icon: <ShieldX className="w-5 h-5 text-amber-500" />,
    };
  }

  if (status === 404) {
    return {
      message: serverMsg || 'The requested resource was not found.',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    };
  }

  if (status && status >= 500) {
    return {
      message: 'Server error. Our team has been notified. Please try again later.',
      icon: <ServerCrash className="w-5 h-5 text-red-500" />,
    };
  }

  return {
    message: serverMsg || 'Something went wrong. Please try again.',
    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
  };
}

/**
 * Drop-in error banner for any screen.
 * Translates HTTP status codes into friendly messages.
 */
export function ApiErrorBanner({ error, onRetry, className = '' }: Props) {
  const { message, icon } = getErrorInfo(error);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 ${className}`}
    >
      <div className="shrink-0">{icon}</div>
      <p className="flex-1 text-sm font-semibold text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
