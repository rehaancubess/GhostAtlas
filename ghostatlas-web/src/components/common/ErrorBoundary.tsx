import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReturnHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default horror-themed error page
      return (
        <div className="min-h-screen bg-ghost-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            {/* Ghost icon with error */}
            <div className="mb-8 relative inline-block">
              <svg
                className="w-32 h-32 text-ghost-green opacity-50"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9v7l-2 2v2h18v-2l-2-2V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v7.17l1 1V19H6v-.83l1-1V9c0-2.76 2.24-5 5-5z" />
                <circle cx="9" cy="11" r="1.5" />
                <circle cx="15" cy="11" r="1.5" />
                <path d="M12 16c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z" />
              </svg>
              <div className="absolute inset-0 animate-ping opacity-20">
                <svg
                  className="w-32 h-32 text-ghost-green"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9v7l-2 2v2h18v-2l-2-2V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v7.17l1 1V19H6v-.83l1-1V9c0-2.76 2.24-5 5-5z" />
                  <circle cx="9" cy="11" r="1.5" />
                  <circle cx="15" cy="11" r="1.5" />
                  <path d="M12 16c-1.1 0-2-.9-2h4c0 1.1-.9 2-2 2z" />
                </svg>
              </div>
            </div>

            {/* Error message */}
            <h1 className="text-4xl md:text-5xl font-creepster text-ghost-green mb-4 text-glow">
              The spirits are restless...
            </h1>
            <p className="text-lg text-ghost-gray mb-8">
              Something paranormal has occurred. The veil between worlds has been disrupted.
            </p>

            {/* Error details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-8 p-4 bg-ghost-dark-gray border border-ghost-green rounded-lg text-left overflow-auto max-h-48">
                <p className="text-sm text-ghost-green font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-ghost-gray font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-ghost-green text-ghost-black font-medium rounded-md hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ghost-green focus-visible:ring-offset-2 focus-visible:ring-offset-ghost-black"
              >
                Retry
              </button>
              <button
                onClick={this.handleReturnHome}
                className="px-6 py-3 bg-transparent text-ghost-green border border-ghost-green font-medium rounded-md hover:bg-ghost-green hover:text-ghost-black hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ghost-green focus-visible:ring-offset-2 focus-visible:ring-offset-ghost-black"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
