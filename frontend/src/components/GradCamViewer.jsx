import React, { useState } from 'react';

export default function GradCamViewer({ originalUrl, gradcamUrl, prediction }) {
  const [activeView, setActiveView] = useState('side-by-side'); // 'side-by-side' or 'overlay'

  if (!gradcamUrl) return null;

  return (
    <div className="gradcam-card">
      <div className="gradcam-header">
        <div>
          <h3 className="section-title">Explainable AI (Grad-CAM Visualization)</h3>
          <p className="section-subtitle">
            Gradient-weighted Class Activation Mapping highlighting retinal features that influenced the model's prediction for <strong>Grade {prediction?.grade}: {prediction?.diagnosis}</strong>.
          </p>
        </div>
        <div className="view-toggle">
          <button
            type="button"
            className={`btn-toggle ${activeView === 'side-by-side' ? 'active' : ''}`}
            onClick={() => setActiveView('side-by-side')}
          >
            Side-by-Side
          </button>
          <button
            type="button"
            className={`btn-toggle ${activeView === 'overlay' ? 'active' : ''}`}
            onClick={() => setActiveView('overlay')}
          >
            Heatmap Focus
          </button>
        </div>
      </div>

      <div className="xai-explanation-banner">
        <div className="xai-info-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="xai-info-text">
          <strong>Why did the model make this prediction?</strong>
          <p>
            The highlighted warm regions (red, orange, yellow) indicate areas of highest convolutional activation in the EfficientNet-B0 feature maps.
            These spatial activations reflect morphological patterns (e.g., microaneurysms, exudates, hemorrhages, or neovascularization) that steered the neural network's decision.
            Grad-CAM provides feature attribution and does not substitute for lesion-level clinical segmentations.
          </p>
        </div>
      </div>

      {activeView === 'side-by-side' ? (
        <div className="images-comparison-grid">
          <div className="image-card">
            <div className="image-card-header">
              <span className="image-badge">Original Fundus</span>
              <span className="image-meta">Patient Retinal Input</span>
            </div>
            <div className="image-frame">
              <img src={originalUrl} alt="Original Retinal Fundus" className="responsive-fundus" />
            </div>
          </div>

          <div className="image-card">
            <div className="image-card-header">
              <span className="image-badge xai-badge">Grad-CAM Explanation</span>
              <span className="image-meta">EfficientNet-B0 Conv-Head</span>
            </div>
            <div className="image-frame">
              <img src={gradcamUrl} alt="Grad-CAM Activation Heatmap" className="responsive-fundus" />
            </div>
          </div>
        </div>
      ) : (
        <div className="single-focus-container">
          <div className="image-card focus-card">
            <div className="image-card-header">
              <span className="image-badge xai-badge">Grad-CAM Overlay Focus</span>
              <span className="image-meta">High Attention Regions</span>
            </div>
            <div className="image-frame">
              <img src={gradcamUrl} alt="Grad-CAM Overlay" className="responsive-fundus focus-image" />
            </div>
          </div>
        </div>
      )}

      <div className="heatmap-legend">
        <span className="legend-label">Activation Intensity:</span>
        <div className="legend-gradient">
          <span className="legend-min">Low Attention</span>
          <div className="gradient-bar"></div>
          <span className="legend-max">High Attention</span>
        </div>
      </div>
    </div>
  );
}
