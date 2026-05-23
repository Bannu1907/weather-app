import React from 'react';
import './ErrorBanner.css';

export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-icon">⚠️</span>
      <div className="error-body">
        <strong className="error-title">Something went wrong</strong>
        <span className="error-msg">{message}</span>
      </div>
      <button className="error-close" onClick={onDismiss} aria-label="Dismiss error">✕</button>
    </div>
  );
}