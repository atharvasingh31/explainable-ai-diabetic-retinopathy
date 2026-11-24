import cv2
import numpy as np
from PIL import Image

def check_image_quality(image: Image.Image) -> dict:
    """
    Computes image quality metrics as defined in the development notebook:
    1. Blur: Laplacian variance
    2. Brightness: Mean grayscale intensity
    3. Contrast: Standard deviation of grayscale intensity

    Does NOT apply arbitrary rejection thresholds. Returns raw numeric scores.
    """
    rgb_arr = np.array(image.convert("RGB"))
    gray = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2GRAY)

    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray))
    contrast = float(np.std(gray))

    return {
        "blur": round(blur_score, 2),
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2)
    }
