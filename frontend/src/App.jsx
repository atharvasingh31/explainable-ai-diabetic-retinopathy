import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ResultsDashboard from './components/ResultsDashboard';
import MedicalDisclaimer from './components/MedicalDisclaimer';
import { checkHealth, predictRetina } from './services/api';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ loaded: false, checking: true });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [activeImageUrl, setActiveImageUrl] = useState(null);

  // Check backend health on initial load and periodically
  useEffect(() => {
    let isMounted = true;

    async function verifyBackend() {
      try {
        const res = await checkHealth();
        if (isMounted) {
          setBackendStatus({ loaded: res.model_loaded, checking: false });
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus({ loaded: false, checking: false });
        }
      }
    }

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAnalyze = async (file, previewUrl) => {
    setIsLoading(true);
    setAnalysisError(null);
    setActiveImageUrl(previewUrl);

    try {
      const data = await predictRetina(file);
      if (data.success) {
        setPredictionResult(data);
      } else {
        throw new Error(data.error || 'Prediction returned unexpected status');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Failed to complete retinal image analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScan = () => {
    setPredictionResult(null);
    setAnalysisError(null);
    setActiveImageUrl(null);
  };

  return (
    <div className="app-shell">
      <Header backendStatus={backendStatus} />

      <main className="main-content">
        {!backendStatus.loaded && !backendStatus.checking && (
          <div className="alert-banner warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="alert-icon">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>FastAPI Backend Server Offline or Initializing</strong>
              <p>Please ensure the backend is running (`uvicorn backend.main:app --port 8000`).</p>
            </div>
          </div>
        )}

        {analysisError && (
          <div className="alert-banner error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="alert-icon">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <div>
              <strong>Analysis Failed</strong>
              <p>{analysisError}</p>
            </div>
            <button className="btn-close-alert" onClick={() => setAnalysisError(null)}>Dismiss</button>
          </div>
        )}

        {!predictionResult ? (
          <div className="upload-section-wrapper">
            <div className="welcome-banner">
              <h2>AI-Assisted Diabetic Retinopathy Screening</h2>
              <p>
                Automated clinical grading of fundus photography using EfficientNet-B0 with integrated Grad-CAM explainability, Image Quality validation, and referral decision support.
              </p>
            </div>

            <ImageUpload
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />

            {isLoading && (
              <div className="loading-state-card">
                <div className="pulse-loader">
                  <div className="pulse-circle"></div>
                </div>
                <h3>Analyzing retinal image...</h3>
                <p className="loading-subtext">
                  Evaluating image quality, executing EfficientNet-B0 inference, and computing Grad-CAM feature activations...
                </p>
                <div className="loading-steps">
                  <div className="step-item active">Image Preprocessing</div>
                  <div className="step-item active">Quality Metrics</div>
                  <div className="step-item active">Deep Learning Inference</div>
                  <div className="step-item active">Grad-CAM Heatmap</div>
                </div>
              </div>
            )}

            <MedicalDisclaimer />
          </div>
        ) : (
          <ResultsDashboard
            result={predictionResult}
            originalImageUrl={activeImageUrl}
            onNewScan={handleNewScan}
          />
        )}
      </main>

      <footer className="footer-container">
        <p>Smart India Hackathon 2026 | Explainable AI Diabetic Retinopathy Screening System</p>
        <p className="footer-sub">Trained on APTOS 2019 Blindness Detection Dataset • EfficientNet-B0 Architecture</p>
      </footer>
    </div>
  );
}
