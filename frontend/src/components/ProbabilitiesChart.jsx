import React from 'react';

const GRADE_ORDER = [
  { key: 'No DR', label: 'Grade 0: No DR', color: '#10b981' },
  { key: 'Mild DR', label: 'Grade 1: Mild DR', color: '#3b82f6' },
  { key: 'Moderate DR', label: 'Grade 2: Moderate DR', color: '#f59e0b' },
  { key: 'Severe DR', label: 'Grade 3: Severe DR', color: '#f97316' },
  { key: 'Proliferative DR', label: 'Grade 4: Proliferative DR', color: '#ef4444' },
];

export default function ProbabilitiesChart({ probabilities, predictedGrade }) {
  if (!probabilities) return null;

  return (
    <div className="probabilities-card">
      <h3 className="section-title">Model Class Probabilities</h3>
      <p className="section-subtitle">
        Softmax probability distribution computed by the EfficientNet-B0 classifier across all 5 clinical stages.
      </p>

      <div className="prob-bars-container">
        {GRADE_ORDER.map((item, idx) => {
          const val = probabilities[item.key] ?? 0;
          const isPredicted = predictedGrade === idx;

          return (
            <div key={item.key} className={`prob-row ${isPredicted ? 'highlight-row' : ''}`}>
              <div className="prob-header">
                <span className="prob-label">
                  {item.label}
                  {isPredicted && <span className="predicted-tag">Predicted</span>}
                </span>
                <span className="prob-value">{val.toFixed(1)}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, val))}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
