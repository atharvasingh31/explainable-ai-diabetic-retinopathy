import io
import base64
import numpy as np
import torch
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

class GradCAMExplainer:
    """
    Grad-CAM explainability generator for EfficientNet-B0.
    Directly extracts feature maps from the model's convolutional head (conv_head)
    to generate heatmap activations corresponding to the predicted DR class.
    """
    def __init__(self, model: torch.nn.Module):
        self.model = model
        # Target layer for EfficientNet-B0: model.conv_head
        if hasattr(model, "conv_head"):
            self.target_layers = [model.conv_head]
        elif hasattr(model, "blocks") and len(model.blocks) > 0:
            self.target_layers = [model.blocks[-1]]
        else:
            raise ValueError("Unable to determine target layer for GradCAM on this model architecture.")
        
        self.cam = GradCAM(model=self.model, target_layers=self.target_layers)

    def generate_heatmap(self, original_image: Image.Image, input_tensor: torch.Tensor, target_class: int) -> str:
        """
        Generates Grad-CAM visualization overlay and returns it as a Base64 JPEG data URL.
        """
        targets = [ClassifierOutputTarget(target_class)]
        
        # Calculate grayscale CAM
        grayscale_cam = self.cam(input_tensor=input_tensor, targets=targets)[0]

        # Resize original image to (224, 224) matching model spatial dimensions
        resized_original = original_image.convert("RGB").resize((224, 224))
        rgb_img = np.array(resized_original).astype(np.float32) / 255.0

        # Generate overlay
        visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

        # Convert to base64 data URL
        pil_vis = Image.fromarray(visualization)
        buffer = io.BytesIO()
        pil_vis.save(buffer, format="JPEG", quality=90)
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{encoded}"
