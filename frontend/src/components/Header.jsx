import React from 'react';

export default function Header({ backendStatus }) {
  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M2.05 12a10 10 0 0 1 19.9 0" />
            <path d="M2.05 12a10 10 0 0 0 19.9 0" />
          </svg>
        </div>
        <div>
          <h1 className="header-title">RetinaScan XAI</h1>
          <p className="header-subtitle">Explainable AI Diabetic Retinopathy Screening Platform</p>
        </div>
      </div>

      <div className="header-meta">
        <div className="model-badge">
          <span className="badge-label">Model:</span>
          <span className="badge-value">EfficientNet-B0</span>
        </div>
        <div className={`status-pill ${backendStatus.loaded ? 'online' : 'offline'}`}>
          <span className="status-dot"></span>
          <span>{backendStatus.loaded ? 'Model Ready' : (backendStatus.checking ? 'Connecting...' : 'Backend Offline')}</span>
        </div>
      </div>
    </header>
  );
}
