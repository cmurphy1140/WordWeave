import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshIcon, SparklesIcon } from './icons';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('WordWeave Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId: Math.random().toString(36).substr(2, 9)
    });

    // Report to error tracking service (if available)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you might send this to a service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console for development
    console.group('🚨 WordWeave Error Report');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Full Report:', errorReport);
    console.groupEnd();

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('wordweave_errors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 5 errors
      const recentErrors = existingErrors.slice(-5);
      localStorage.setItem('wordweave_errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('Could not store error in localStorage:', e);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Force a re-render by updating a key or refreshing
    window.location.reload();
  };

  private handleReportProblem = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const subject = encodeURIComponent(`WordWeave Error Report - ${errorId}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error?.message}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

Additional Details:
Please describe what you were doing when this error occurred.
    `);

    const mailtoUrl = `mailto:support@wordweave.app?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <motion.div
          className="error-boundary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="error-boundary-content">
            <motion.div
              className="error-icon"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut'
              }}
            >
              <SparklesIcon className="icon-lg icon-primary" />
            </motion.div>
            
            <motion.h2
              className="error-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Oops! Something went wrong
            </motion.h2>
            
            <motion.p
              className="error-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              WordWeave encountered an unexpected error. Don't worry - your poetry magic is still intact!
            </motion.p>

            {/* Error details (collapsible) */}
            <motion.details
              className="error-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <summary>Technical Details</summary>
              <div className="error-technical">
                <p><strong>Error ID:</strong> {this.state.errorId}</p>
                <p><strong>Message:</strong> {this.state.error?.message}</p>
                <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <details>
                      <summary>Stack Trace</summary>
                      <pre className="error-stack">{this.state.error?.stack}</pre>
                    </details>
                    <details>
                      <summary>Component Stack</summary>
                      <pre className="error-component-stack">
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  </>
                )}
              </div>
            </motion.details>

            {/* Action buttons */}
            <motion.div
              className="error-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                className="error-button primary"
                onClick={this.handleRetry}
              >
                <RefreshIcon className="btn-icon" /> Try Again
              </button>
              
              <button
                className="error-button secondary"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </button>
              
              <button
                className="error-button tertiary"
                onClick={this.handleReportProblem}
              >
                📧 Report Problem
              </button>
            </motion.div>

            {/* Helpful tips */}
            <motion.div
              className="error-tips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h4>Things you can try:</h4>
              <ul>
                <li>Refresh the page or try again</li>
                <li>Check your internet connection</li>
                <li>Try with different words</li>
                <li>Clear your browser cache</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;
