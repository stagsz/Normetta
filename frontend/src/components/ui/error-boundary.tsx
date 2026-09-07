'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const swedishFallback = {
  title: 'Något gick fel',
  description: 'Ett oväntat fel inträffade. Försök igen eller gå till startsidan.',
  retry: 'Försök igen',
  home: 'Till startsidan',
};

const englishFallback = {
  title: 'Something went wrong',
  description: 'An unexpected error occurred. Please try again or return to the home page.',
  retry: 'Try Again',
  home: 'Go to Home',
};

function pickLocaleFallback(): typeof swedishFallback {
  try {
    if (typeof window === 'undefined') return englishFallback;
    const saved = window.localStorage.getItem('af-locale');
    if (saved === 'sv') return swedishFallback;
  } catch {
    // ignore
  }
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('sv')) {
    return swedishFallback;
  }
  return englishFallback;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const fallback = pickLocaleFallback();

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto rounded-full bg-red-50 p-4 mb-4 w-fit">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-xl text-[var(--text-strong)]">
                {fallback.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-[var(--text-muted)]">
                {fallback.description}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-[var(--surface-sunken)] rounded-md overflow-auto">
                  <p className="text-sm font-medium text-[var(--text-body)] mb-2">
                    Error details:
                  </p>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <p className="text-sm font-medium text-[var(--text-body)] mt-3 mb-2">
                        Component stack:
                      </p>
                      <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {fallback.retry}
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  {fallback.home}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
