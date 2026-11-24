import React from 'react';

export default function QualityMetrics({ quality }) {
  if (!quality) return null;

  return (
    <div className="quality-card">
      <div className="quality-header">
        <h3 className="section-title">Image Quality Assessment</h3>
        <span className="info-badge">Objective Metrics</span>
      </div>
      <p className="section-subtitle">
        Quantitative image analysis computed from the uploaded retinal photograph using Laplacian variance and intensity distribution.
      </p>

      <div className="quality-grid">
        <div className="metric-box">
          <div className="metric-icon blur-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Blur Score (Laplacian)</span>
            <span className="metric-value">{quality.blur?.toFixed(1) ?? 'N/A'}</span>
            <span className="metric-desc">Higher values typically correspond to sharper retinal vasculature details.</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon brightness-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Brightness (Mean Intensity)</span>
            <span className="metric-value">{quality.brightness?.toFixed(1) ?? 'N/A'}</span>
            <span className="metric-desc">Average illumination across retinal grayscale plane (0–255).</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon contrast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Contrast (Std Deviation)</span>
            <span className="metric-value">{quality.contrast?.toFixed(1) ?? 'N/A'}</span>
            <span className="metric-desc">Dynamic range separation between fundus background and vessels.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
