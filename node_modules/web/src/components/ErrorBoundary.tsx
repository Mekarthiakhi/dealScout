import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to external error tracking service here
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Oops! Something went wrong</h2>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              We encountered an unexpected error. This has been logged and our team will look into it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-slate-950 border border-red-500/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-red-400 text-xs font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Go Home
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
