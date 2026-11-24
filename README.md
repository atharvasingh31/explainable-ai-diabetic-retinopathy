# Explainable AI Diabetic Retinopathy Screening System (SIH 2026 - Problem SIH26038)

An AI-assisted clinical screening platform for Diabetic Retinopathy (DR) that evaluates retinal fundus photographs, predicts disease severity grades (0 to 4), generates real-time Gradient-weighted Class Activation Maps (**Grad-CAM**), performs objective image quality analysis, and delivers clear referral guidance (**REFER** vs **NOT REFER**).

---

## 1. Project Overview

Diabetic Retinopathy is one of the leading causes of preventable blindness worldwide. Early detection through regular screening is vital to preserve sight, yet specialized ophthalmologists are in short supply in remote and underserved clinical environments.

This application provides a reliable, transparent, and interpretable AI screening assistant designed for primary healthcare workers, nurses, and clinicians:
- **Trained Deep Learning Architecture**: EfficientNet-B0 trained on the APTOS 2019 Blindness Detection dataset.
- **Explainability (XAI)**: Native Grad-CAM visualizations generated directly from the convolutional feature maps of the production model.
- **Image Quality Verification**: Quantitative assessments of sharpness (Laplacian variance), illumination (mean intensity), and contrast (standard deviation) without arbitrary rejection thresholds.
- **Referral Decision Support**: Clear, standards-aligned triage (Non-Referable for Grades 0–1; Referable for Grades 2–4).
- **Responsible AI Disclaimer**: Explicit clinical communication stating this is a decision-support screening tool, not a substitute for a licensed ophthalmologist.

---

## 2. System Architecture

```
[ Healthcare Worker / User ]
            │
            ▼ (Upload Retinal Fundus Image)
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│  - Drag-and-drop file upload with format/size checks        │
│  - Instant preview & sample image loader                   │
│  - Live API communication (services/api.js)                 │
│  - Results dashboard with severity themes & XAI overlays    │
└─────────────────────────────────────────────────────────────┘
            │  multipart/form-data
            ▼  POST /predict
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│  - Startup model initialization (loaded ONCE into memory)   │
│  - Input validation (JPG, JPEG, PNG <= 20MB)                │
│  - In-memory RGB conversion                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
┌─────────────────────────┐   ┌───────────────────────────────┐
│ Image Quality Analysis  │   │  Deterministic Preprocessing  │
│ - Blur (Laplacian var)  │   │  - Resize: 224 × 224          │
│ - Brightness (Mean)     │   │  - Normalize (ImageNet stats) │
│ - Contrast (Std Dev)    │   │  - Convert to 4D Tensor       │
└─────────────────────────┘   └───────────────┬───────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │  EfficientNet-B0 Inference  │
                               │  - Model: SIH26038_final_model│
                               │  - Softmax probability dist │
                               │  - Grade 0-4 Classification │
                               │  - Referral logic (>= 2)    │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │     Grad-CAM Explainer      │
                               │  - Target layer: conv_head  │
                               │  - Grayscale activation map │
                               │  - Colormap overlay (RGB)   │
                               │  - Base64 JPEG data URL     │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     JSON Response (HTTP 200)                │
│  - DR Grade & Diagnosis (Grade 0 - 4)                       │
│  - Model Confidence (%)                                     │
│  - Referral Decision (REFER / NOT REFER)                    │
│  - 5-Class Probabilities breakdown                          │
│  - Quality Metrics (blur, brightness, contrast)             │
│  - Grad-CAM Base64 Heatmap Data URI                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. ML Model Details

| Attribute | Specification |
| :--- | :--- |
| **Framework** | PyTorch (`torch`) |
| **Architecture** | `efficientnet_b0` (timm library) |
| **Weights File** | `SIH26038_final_model.pth` |
| **Training Dataset** | APTOS 2019 Blindness Detection Dataset |
| **Input Resolution** | 224 × 224 pixels |
| **Input Normalization** | ImageNet Mean `[0.485, 0.456, 0.406]`, Std `[0.229, 0.224, 0.225]` |
| **Output Classes** | 5 (Multiclass classification: Grades 0 to 4) |
| **Loss Function** | Cross-Entropy Loss with Class Weights |
| **Explainability** | Grad-CAM targeting `model.conv_head` |
| **Inference Mode** | Strictly deterministic evaluation (`model.eval()`, `torch.no_grad()`) |

> **Note on Research Work**: The exploratory U-Net lesion segmentation models for IDRiD detailed in the exploratory notebook (`038-2.ipynb`) are research experiments preserved for future lesion-level annotations and are strictly separated from this production classification and screening pipeline.

---

## 4. Folder Structure

```
.
├── backend/
│   ├── main.py                     # FastAPI application & endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── model/
│   │   ├── SIH26038_final_model.pth # Production EfficientNet-B0 weights
│   │   └── inference.py            # Singleton model loader, inference & XAI
│   ├── utils/
│   │   ├── preprocessing.py        # Deterministic 224x224 ImageNet transform
│   │   ├── quality.py              # Laplacian variance, brightness & contrast
│   │   └── gradcam.py              # Real Grad-CAM generator (conv_head)
│   ├── static/
│   │   ├── index.html              # Standalone interactive React UI
│   │   ├── index.css               # Clinical design system stylesheet
│   │   └── sample_fundus_retina.jpg# Sample fundus image for one-click testing
│   └── uploads/                    # Temporary scratch storage
│
├── frontend/
│   ├── index.html                  # Vite HTML entry point
│   ├── package.json                # React frontend manifest & dependencies
│   ├── vite.config.js              # Vite server configuration
│   ├── public/
│   │   └── sample_fundus_retina.jpg# Sample retina asset
│   └── src/
│       ├── App.jsx                 # Main React application workflow
│       ├── main.jsx                # React root mounter
│       ├── index.css               # Healthcare UI styling
│       ├── services/
│       │   └── api.js              # Dedicated API service (POST /predict)
│       └── components/
│           ├── Header.jsx          # Branding & backend status pill
│           ├── ImageUpload.jsx     # Drag-and-drop file upload & preview
│           ├── ResultsDashboard.jsx# Comprehensive clinical result view
│           ├── GradCamViewer.jsx   # Side-by-side & overlay Grad-CAM viewer
│           ├── ProbabilitiesChart.jsx# 5-class horizontal progress bars
│           ├── QualityMetrics.jsx  # Image quality metrics card
│           └── MedicalDisclaimer.jsx# Clinical regulatory notice
│
├── 038-2.ipynb                     # Original ML development notebook
├── run_backend.sh                  # One-click startup script for FastAPI
├── sample_fundus_retina.jpg        # Local sample retinal fundus photograph
└── README.md                       # Comprehensive documentation
```

---

## 5. Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm (optional for Vite dev server; the backend serves the built React UI automatically)

### Backend Setup

1. **Activate the Virtual Environment**:
   ```bash
   # From the project root
   source ./venv/bin/activate
   ```

2. **Verify Python Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

### Frontend Setup (Optional for Vite Dev Server)

If you wish to run the standalone Vite development server:
```bash
cd frontend
npm install
npm run dev
```

---

## 6. How to Run

### Option A: Complete System via FastAPI (Recommended)

The FastAPI server comes pre-configured with the complete, interactive React interface served directly at `http://localhost:8000/`.

Run using the helper script:
```bash
./run_backend.sh
```

Or run manually using Uvicorn:
```bash
export MPLCONFIGDIR=/tmp/matplotlib
export PYTHONPATH=.:./venv.nosync/lib/python3.10/site-packages
/Library/Frameworks/Python.framework/Versions/3.10/bin/python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Open your browser to:
- **Interactive Web Application**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### Option B: Separate Frontend Development Server

If iterating on the React frontend components using Vite:
1. Start the FastAPI backend on port 8000:
   ```bash
   ./run_backend.sh
   ```
2. In a separate terminal, launch the Vite dev server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173`. The frontend automatically proxies requests to `http://localhost:8000`.

---

## 7. Model Placement & Compatibility

The production weights file `SIH26038_final_model.pth` must be located at:
```
backend/model/SIH26038_final_model.pth
```
(A root copy also exists at `./SIH26038_final_model.pth`).

The model loader dynamically checks the architecture:
- If pickled as a complete `timm.models.efficientnet.EfficientNet` object, it loads directly into evaluation mode.
- If pickled as a `state_dict`, it instantiates `timm.create_model("efficientnet_b0", pretrained=False, num_classes=5)` and executes `model.load_state_dict(...)`.

---

## 8. Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port for the FastAPI server |
| `HOST` | `0.0.0.0` | Host binding for Uvicorn |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin for Vite dev server |
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL used by the React client |
| `MPLCONFIGDIR` | `/tmp/matplotlib` | Writable cache path for Matplotlib runtime |

---

## 9. API Documentation

### 1. Health Check
- **Endpoint**: `GET /health`
- **Description**: Returns system status and verifies that EfficientNet-B0 is loaded into memory.
- **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "model_loaded": true
  }
  ```

### 2. Predict & Explain
- **Endpoint**: `POST /predict`
- **Content-Type**: `multipart/form-data`
- **Parameter**: `image` (File: JPG, JPEG, or PNG, max 20 MB)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "prediction": {
      "grade": 1,
      "diagnosis": "Mild Diabetic Retinopathy",
      "confidence": 48.7,
      "referable": false,
      "referral_status": "NOT REFER"
    },
    "probabilities": {
      "No DR": 47.82,
      "Mild DR": 48.68,
      "Moderate DR": 3.47,
      "Severe DR": 0.01,
      "Proliferative DR": 0.03
    },
    "quality": {
      "blur": 653.79,
      "brightness": 89.66,
      "contrast": 68.84
    },
    "gradcam": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }
  ```

### 3. Error Responses
- **400 Bad Request**: Missing file, invalid format, empty file, or unreadable/corrupted image.
- **413 Request Entity Too Large**: File exceeds 20MB.
- **500 Internal Server Error**: Internal runtime or inference exception (sanitized message returned).

---

## 10. Prediction Classes & Referral Logic

The system categorizes findings into the 5 International Clinical Diabetic Retinopathy (ICDR) disease severity stages:

| Grade | Clinical Diagnosis | Referral Status | Action Guidance |
| :---: | :--- | :---: | :--- |
| **0** | **No Diabetic Retinopathy** | **NOT REFER** | Annual regular diabetic eye examination |
| **1** | **Mild Diabetic Retinopathy** | **NOT REFER** | Microaneurysms only; annual monitoring |
| **2** | **Moderate Diabetic Retinopathy** | **REFER** | Multiple microaneurysms, blot hemorrhages, or hard exudates; specialist review recommended |
| **3** | **Severe Diabetic Retinopathy** | **REFER** | >20 intraretinal hemorrhages per quadrant, venous beading, or IRMA; prompt ophthalmologist review |
| **4** | **Proliferative Diabetic Retinopathy** | **REFER** | Neovascularization, vitreous hemorrhage; urgent specialist intervention |

---

## 11. Explainable AI (Grad-CAM)

Gradient-weighted Class Activation Mapping computes the gradient of the predicted class score with respect to the feature activation maps in the final convolutional layer of EfficientNet-B0 (`model.conv_head`):

1. **Target Layer**: `model.conv_head` captures high-level morphological semantic patterns prior to global pooling.
2. **Backpropagation**: Gradients of the target class logit flow back to the feature maps.
3. **Weighting & ReLU**: Feature maps are pooled and weighted, with a Rectified Linear Unit (ReLU) isolating positively contributing visual features.
4. **Visualization**: Scaled onto the original fundus photograph using an RGB colormap (Jet), where warmer colors (red/yellow) indicate spatial regions that most strongly influenced the network's prediction.

---

## 12. Image Quality Metrics

To aid clinicians in evaluating whether an image is diagnostic, three objective metrics are calculated:

1. **Blur Score**: Computed via the variance of the Laplacian operator:
   $$\text{Blur} = \text{Var}(\nabla^2 I)$$
   A higher variance generally indicates sharper vascular and optic disc boundaries.
2. **Brightness**: Mean grayscale pixel intensity:
   $$\text{Brightness} = \frac{1}{N} \sum_{i, j} I(i, j) \quad \in [0, 255]$$
3. **Contrast**: Standard deviation of grayscale pixel intensity:
   $$\text{Contrast} = \sqrt{\frac{1}{N} \sum_{i, j} (I(i, j) - \mu)^2}$$

*Per clinical instructions, these metrics are informational and do not reject images based on arbitrary cutoffs.*

---

## 13. Clinical & Medical Disclaimer

> **IMPORTANT**:
> **This tool is an AI-assisted screening system and is not a substitute for professional medical diagnosis.**
> Results should be reviewed by a qualified healthcare professional. Do not modify medical regimens, prescribe interventions, or dismiss clinical symptoms based solely on automated screening outputs.

---

## 14. Verification & Testing

Verify system health and prediction using the built-in automated test suite:

```bash
MPLCONFIGDIR=/tmp/matplotlib \
PYTHONPATH=.:./venv.nosync/lib/python3.10/site-packages \
/Library/Frameworks/Python.framework/Versions/3.10/bin/python3 -c "
from fastapi.testclient import TestClient
from backend.main import app

with TestClient(app) as client:
    health = client.get('/health').json()
    assert health['model_loaded'] is True
    print('Health OK:', health)

    with open('sample_fundus_retina.jpg', 'rb') as f:
        res = client.post('/predict', files={'image': ('sample.jpg', f, 'image/jpeg')})
    assert res.status_code == 200
    data = res.json()
    print('Prediction OK: Grade', data['prediction']['grade'], data['prediction']['diagnosis'])
    print('Referral:', data['prediction']['referral_status'])
    print('Quality:', data['quality'])
    print('Grad-CAM Data URI Length:', len(data['gradcam']))
print('All checks verified successfully!')
"
```
