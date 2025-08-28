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
      return <h1>오류 발생! 콘솔 확인</h1>;
    }
    return this.props.children;
  }
}
