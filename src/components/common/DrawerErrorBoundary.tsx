'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface DrawerErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface DrawerErrorBoundaryProps {
  children: React.ReactNode
}

class DrawerErrorBoundary extends React.Component<
  DrawerErrorBoundaryProps,
  DrawerErrorBoundaryState
> {
  constructor(props: DrawerErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): DrawerErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    })
    
    // Log error details for debugging
    console.error('Drawer error boundary caught an error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px] bg-gray-50">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                The step editor encountered an error. Please try refreshing or contact support if the problem persists.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-800 whitespace-pre-wrap">
                  <div className="font-semibold mb-2">Error:</div>
                  {this.state.error.message}
                  
                  <div className="font-semibold mt-3 mb-2">Stack:</div>
                  {this.state.error.stack}
                  
                  {this.state.errorInfo && (
                    <>
                      <div className="font-semibold mt-3 mb-2">Component Stack:</div>
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default DrawerErrorBoundary