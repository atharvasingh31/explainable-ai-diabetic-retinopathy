import React from 'react';

export default function MedicalDisclaimer() {
  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className="disclaimer-content">
        <h4 className="disclaimer-title">Clinical & Medical Disclaimer</h4>
        <p className="disclaimer-text">
          This tool is an AI-assisted screening system and is not a substitute for professional medical diagnosis.
          Results should be reviewed by a qualified healthcare professional. Do not alter therapeutic treatments or ignore clinical judgment based solely on automated screening outputs.
        </p>
      </div>
    </div>
  );
}
