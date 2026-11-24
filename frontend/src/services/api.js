/**
 * API Service for Diabetic Retinopathy Screening System.
 * Connects directly to the FastAPI backend endpoints:
 * - GET /health
 * - POST /predict
 */

const API_BASE_URL = import.meta?.env?.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.port === '8000'
    ? ''
    : 'http://localhost:8000'
);

/**
 * Check backend health and model loading status.
 * @returns {Promise<{status: string, model_loaded: boolean}>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Upload a retinal fundus image for real EfficientNet-B0 inference and Grad-CAM generation.
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<Object>} The complete screening result JSON
 */
export async function predictRetina(imageFile) {
  if (!imageFile) {
    throw new Error('Please select an image file before analyzing.');
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Inference request failed';
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      errorDetail = `Server returned status ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}
