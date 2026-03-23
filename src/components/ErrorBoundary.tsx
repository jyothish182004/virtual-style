import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full bento-card p-12 text-center space-y-8">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-display font-medium tracking-tight">Something went wrong</h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            An unexpected error occurred. We've been notified and are looking into it.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-neutral-50 rounded-xl text-left overflow-auto max-h-40">
            <code className="text-[10px] font-mono text-neutral-400">
              {error.message}
            </code>
          </div>
        )}

        <button
          onClick={resetErrorBoundary}
          className="w-full flex items-center justify-center gap-3 bg-brand-black text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all duration-300"
        >
          <RefreshCcw className="w-4 h-4" />
          Reload Application
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
}
