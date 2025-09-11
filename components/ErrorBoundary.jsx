'use client';

import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>An unexpected error occurred. Please check the console.</h1>;
    }
    return this.props.children;
  }
}
