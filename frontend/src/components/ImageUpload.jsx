import React, { useState, useRef } from 'react';

export default function ImageUpload({ onAnalyze, isLoading, onSampleSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setErrorMsg(null);
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload a JPG, JPEG, or PNG fundus image.');
      return;
    }

    // Validate size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 20MB limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile) {
      onAnalyze(selectedFile, previewUrl);
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/sample_fundus_retina.jpg');
      if (!response.ok) {
        throw new Error('Sample retina image could not be loaded.');
      }
      const blob = await response.blob();
      const file = new File([blob], 'sample_fundus_retina.jpg', { type: 'image/jpeg' });
      handleFile(file);
    } catch (err) {
      setErrorMsg('Sample image not available in current directory.');
    }
  };

  return (
    <div className="upload-card">
      <div className="card-header">
        <h2 className="card-title">Retinal Fundus Image Upload</h2>
        <p className="card-description">
          Upload a standard macula-centered or disc-centered retinal photograph (JPG, JPEG, or PNG format).
        </p>
      </div>

      {!previewUrl ? (
        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          <div className="dropzone-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="dropzone-text">
            <strong>Click to upload</strong> or drag and drop retinal image
          </p>
          <p className="dropzone-hint">Supported formats: JPG, JPEG, PNG (Max: 20MB)</p>
          
          <button
            type="button"
            className="btn-sample"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadSample();
            }}
          >
            Or load built-in sample retina
          </button>
        </div>
      ) : (
        <div className="preview-container">
          <div className="preview-image-wrapper">
            <img src={previewUrl} alt="Retinal Preview" className="preview-image" />
            <div className="preview-overlay-info">
              <span className="file-name">{selectedFile?.name}</span>
              <span className="file-size">
                {selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : ''}
              </span>
            </div>
          </div>

          <div className="preview-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isLoading}
            >
              Change Image
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAnalyzeClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing Retina...
                </>
              ) : (
                'Analyze Retina'
              )}
            </button>
          </div>
        </div>
      )}

      {errorMsg && <div className="alert-error">{errorMsg}</div>}
    </div>
  );
}
