import React from 'react';
import GradCamViewer from './GradCamViewer';
import ProbabilitiesChart from './ProbabilitiesChart';
import QualityMetrics from './QualityMetrics';
import MedicalDisclaimer from './MedicalDisclaimer';

export default function ResultsDashboard({ result, originalImageUrl, onNewScan }) {
  if (!result || !result.prediction) return null;

  const { grade, diagnosis, confidence, referable, referral_status } = result.prediction;

  // Grade color scheme
  const getGradeTheme = (g) => {
    switch (g) {
      case 0:
        return { badge: 'grade-0', label: 'No DR', text: 'Normal Retinal Presentation' };
      case 1:
        return { badge: 'grade-1', label: 'Mild DR', text: 'Microaneurysms Detected' };
      case 2:
        return { badge: 'grade-2', label: 'Moderate DR', text: 'Multiple Lesions / Exudates' };
      case 3:
        return { badge: 'grade-3', label: 'Severe DR', text: 'Extensive Hemorrhages / IRMA' };
      case 4:
        return { badge: 'grade-4', label: 'Proliferative DR', text: 'Neovascularization Present' };
      default:
        return { badge: 'grade-unknown', label: `Grade ${g}`, text: '' };
    }
  };

  const gradeTheme = getGradeTheme(grade);

  return (
    <div className="results-container">
      {/* Top Banner with Action Button */}
      <div className="results-top-bar">
        <div>
          <span className="results-eyebrow">Screening Complete</span>
          <h2 className="results-heading">Diabetic Retinopathy Analysis Report</h2>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onNewScan}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Screen Another Image
        </button>
      </div>

      {/* Primary Clinical Summary Cards */}
      <div className="primary-cards-grid">
        {/* Diagnosis & Grade Card */}
        <div className="result-card main-grade-card">
          <div className="card-top">
            <span className="card-kicker">Diabetic Retinopathy Grade</span>
            <span className={`grade-number-badge ${gradeTheme.badge}`}>
              Grade {grade}
            </span>
          </div>
          <h3 className="diagnosis-title">{diagnosis}</h3>
          <p className="diagnosis-desc">{gradeTheme.text}</p>
        </div>

        {/* Model Confidence Card */}
        <div className="result-card confidence-card">
          <div className="card-top">
            <span className="card-kicker">Model Confidence</span>
            <span className="confidence-pill">{confidence.toFixed(1)}%</span>
          </div>
          <div className="confidence-meter-container">
            <div className="confidence-meter-track">
              <div
                className="confidence-meter-fill"
                style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
              ></div>
            </div>
            <p className="confidence-note">
              Estimated statistical probability of the top-1 predicted class. (Note: Represents model confidence, not clinical certainty).
            </p>
          </div>
        </div>

        {/* Referral Status Card */}
        <div className={`result-card referral-card ${referable ? 'refer-active' : 'not-refer-active'}`}>
          <div className="card-top">
            <span className="card-kicker">Referral Decision</span>
            <span className="referral-type-label">
              {referable ? 'Specialist Evaluation Required' : 'Routine Monitoring'}
            </span>
          </div>
          <div className="referral-status-banner">
            <span className="referral-badge-text">{referral_status}</span>
          </div>
          <p className="referral-action-text">
            {referable
              ? 'Recommendation: Patient demonstrates referable diabetic retinopathy signs (Grade ≥ 2). Prompt in-person ophthalmologist review is advised.'
              : 'Recommendation: Non-referable screening result (Grade 0–1). Continue annual regular diabetic eye screening.'}
          </p>
        </div>
      </div>

      {/* Patient Friendly Summary Callout */}
      <div className="patient-summary-callout">
        <div className="patient-callout-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7.5" r="4" />
            <polyline points="17 11 19 13 23 9" />
          </svg>
        </div>
        <div className="patient-callout-content">
          <h4>Patient-Friendly Screening Summary</h4>
          <p>
            AI screening result indicates <strong>{diagnosis}</strong>.
            {' '}
            {referable
              ? 'Professional medical review by an eye care specialist is recommended for formal diagnostic examination and staging.'
              : 'No immediate sight-threatening retinopathy indicated. Regular annual diabetic eye checks should continue.'}
          </p>
        </div>
      </div>

      {/* Explainable AI (Grad-CAM) Section */}
      <GradCamViewer
        originalUrl={originalImageUrl}
        gradcamUrl={result.gradcam}
        prediction={result.prediction}
      />

      {/* Analytics Grid: Probabilities & Quality Metrics */}
      <div className="analytics-grid">
        <ProbabilitiesChart
          probabilities={result.probabilities}
          predictedGrade={grade}
        />
        <QualityMetrics quality={result.quality} />
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}
