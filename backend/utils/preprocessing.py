import torch
from torchvision import transforms
from PIL import Image

# Deterministic inference transform matching the notebook exactly:
# Resize to 224x224, ToTensor, Normalize with ImageNet mean and std
val_test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def preprocess_image(image: Image.Image, device: torch.device) -> torch.Tensor:
    """
    Applies deterministic inference preprocessing.
    Ensures RGB color format, applies ImageNet resize & normalization,
    and returns a 4D batch tensor on the target device.
    """
    rgb_image = image.convert("RGB")
    tensor = val_test_transform(rgb_image).unsqueeze(0).to(device)
    return tensor
