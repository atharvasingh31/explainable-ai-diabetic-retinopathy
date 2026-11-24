import os
import io
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError

from backend.model.inference import dr_model

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retinopathy-api")

# Allowed image MIME types and extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the model once
    logger.info("Initializing application and loading EfficientNet-B0 model...")
    try:
        dr_model.load()
        logger.info("Production EfficientNet-B0 model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load model during startup: {e}", exc_info=True)
        raise RuntimeError(f"Model initialization failed: {e}")
    yield
    # Shutdown
    logger.info("Shutting down API server...")

app = FastAPI(
    title="Diabetic Retinopathy Screening API",
    description="Explainable AI Screening System for Diabetic Retinopathy powered by EfficientNet-B0 and Grad-CAM",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and root UI route
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", include_in_schema=False)
async def serve_ui():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "ok", "message": "Diabetic Retinopathy Screening API running. Visit /docs for Swagger UI."}

@app.get("/health", summary="Health check and model status")
def health_check():
    return {
        "status": "ok",
        "model_loaded": dr_model.is_loaded
    }

@app.post("/predict", summary="Analyze retinal fundus image")
async def predict_retina(image: UploadFile = File(...)):
    # 1. Validation: file presence
    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please upload a valid retinal fundus image."
        )

    # 2. Extension check
    file_ext = os.path.splitext(image.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Please upload a JPG, JPEG, or PNG image."
        )

    # 3. Read content and size check
    try:
        contents = await image.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read uploaded image file."
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # 4. Open with PIL and convert to RGB
    try:
        pil_image = Image.open(io.BytesIO(contents))
        pil_image.verify()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as e:
        logger.warning(f"Corrupted or invalid image uploaded: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid or readable image. Please ensure it is an uncorrupted JPG or PNG fundus photograph."
        )

    # 5. Run prediction, Quality metrics & Grad-CAM
    try:
        result = dr_model.predict(pil_image)
        return result
    except Exception as e:
        logger.error(f"Inference failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while analyzing the retinal image. Please try again with a valid fundus image."
        )

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
