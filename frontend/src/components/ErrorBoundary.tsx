import React from 'react';

export class ErrorBoundary extends React.Component<{
  children: React.ReactNode
}, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can log error info here
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded">
          <h2 className="font-bold text-lg mb-2">Something went wrong.</h2>
          <pre className="text-xs whitespace-pre-wrap">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
