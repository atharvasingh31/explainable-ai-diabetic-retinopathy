import os
import torch
import torch.nn.functional as F
from PIL import Image
import timm

from backend.utils.preprocessing import preprocess_image
from backend.utils.quality import check_image_quality
from backend.utils.gradcam import GradCAMExplainer

CLASS_NAMES = {
    0: "No Diabetic Retinopathy",
    1: "Mild Diabetic Retinopathy",
    2: "Moderate Diabetic Retinopathy",
    3: "Severe Diabetic Retinopathy",
    4: "Proliferative Diabetic Retinopathy"
}

PROBABILITY_KEYS = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR"
}

class DiabeticRetinopathyModel:
    def __init__(self, model_path: str = None):
        if model_path is None:
            model_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(model_dir, "SIH26038_final_model.pth")
        
        self.model_path = model_path
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        self.model = None
        self.gradcam = None
        self.is_loaded = False

    def load(self):
        """
        Loads the trained EfficientNet-B0 model weights once at startup.
        Sets model to evaluation mode.
        """
        if self.is_loaded:
            return

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at {self.model_path}")

        loaded = torch.load(self.model_path, map_location=self.device, weights_only=False)

        if isinstance(loaded, dict):
            # If saved as state_dict
            model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=5)
            model.load_state_dict(loaded)
        elif isinstance(loaded, torch.nn.Module):
            # Full model instance
            model = loaded
        else:
            raise TypeError(f"Unexpected model object type loaded: {type(loaded)}")

        model.to(self.device)
        model.eval()
        self.model = model

        # Initialize Grad-CAM explainer
        self.gradcam = GradCAMExplainer(self.model)
        self.is_loaded = True
        print(f"[Model] EfficientNet-B0 successfully loaded on {self.device} in eval mode.")

    def predict(self, image: Image.Image) -> dict:
        """
        Complete prediction pipeline:
        1. Image Quality Analysis
        2. Preprocessing
        3. Model Forward Pass & Softmax
        4. Grade, Diagnosis & Referral Classification
        5. Grad-CAM Explainability Map
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model is not loaded. Call load() before predicting.")

        # 1. Quality Analysis
        quality_metrics = check_image_quality(image)

        # 2. Preprocess
        input_tensor = preprocess_image(image, self.device)

        # 3. Model forward pass
        with torch.no_grad():
            logits = self.model(input_tensor)
            probabilities = F.softmax(logits, dim=1).squeeze(0)

        predicted_class = int(torch.argmax(probabilities).item())
        confidence = float(probabilities[predicted_class].item() * 100.0)

        # 4. Referral status logic
        # Grade 0, 1 -> Non-referable ("NOT REFER")
        # Grade 2, 3, 4 -> Referable ("REFER")
        referable = predicted_class >= 2
        referral_status = "REFER" if referable else "NOT REFER"

        # 5-class percentage probabilities dictionary
        probs_dict = {}
        for idx in range(5):
            probs_dict[PROBABILITY_KEYS[idx]] = round(float(probabilities[idx].item() * 100.0), 2)

        # 5. Grad-CAM generation
        gradcam_overlay = self.gradcam.generate_heatmap(
            original_image=image,
            input_tensor=input_tensor,
            target_class=predicted_class
        )

        return {
            "success": True,
            "prediction": {
                "grade": predicted_class,
                "diagnosis": CLASS_NAMES[predicted_class],
                "confidence": round(confidence, 1),
                "referable": referable,
                "referral_status": referral_status
            },
            "probabilities": probs_dict,
            "quality": quality_metrics,
            "gradcam": gradcam_overlay
        }

# Global singleton instance
dr_model = DiabeticRetinopathyModel()
