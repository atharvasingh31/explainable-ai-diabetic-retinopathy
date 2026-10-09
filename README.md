# Explainable AI-Based Diabetic Retinopathy Screening

## Overview

This project develops an AI-based system for diabetic retinopathy (DR) screening using retinal fundus images. It combines deep learning classification with explainable AI techniques to support the identification of diabetic retinopathy severity and improve the interpretability of model predictions.

The project uses the **APTOS 2019 Blindness Detection dataset** for five-class disease grading and the **IDRiD dataset** to explore retinal lesion segmentation.

## Key Features

- **Five-Class Classification:** Classifies retinal images into No DR, Mild, Moderate, Severe, and Proliferative DR.
- **Transfer Learning:** Uses a pretrained EfficientNet-B0 architecture fine-tuned for diabetic retinopathy classification.
- **Image Preprocessing:** Resizes, normalizes, and prepares retinal images for model inference.
- **Class Imbalance Handling:** Uses weighted cross-entropy loss during classification model training.
- **Explainable AI:** Uses Grad-CAM visualizations to highlight image regions influencing model predictions.
- **Confidence Scores:** Displays prediction confidence to help interpret model outputs.
- **Lesion Segmentation:** Explores pixel-level retinal lesion segmentation using the IDRiD dataset.
- **Image Quality Analysis:** Examines image characteristics such as blur, brightness, and contrast.

## Datasets

### APTOS 2019 Blindness Detection
Used for five-class diabetic retinopathy grading from retinal fundus images.

### IDRiD
Used for retinal lesion segmentation experiments involving microaneurysms, haemorrhages, hard exudates, and soft exudates.

Please refer to the original dataset sources for their licensing and usage terms.

## Technology Stack

- Python
- PyTorch
- EfficientNet-B0
- NumPy and Pandas
- Scikit-learn
- Matplotlib
- OpenCV / PIL
- Google Colab and CUDA-enabled GPU for model training

## Workflow

1. Load and inspect retinal image datasets.
2. Preprocess and normalize images.
3. Split the classification dataset into training, validation, and test sets.
4. Fine-tune EfficientNet-B0 for five-class DR classification.
5. Evaluate model predictions using classification metrics.
6. Generate Grad-CAM heatmaps for visual explanation.
7. Train and evaluate a separate lesion segmentation model using IDRiD images and masks.
8. Analyze image quality and model performance.

## Evaluation

The project explores classification performance using accuracy, precision, recall, F1-score, and confusion matrices. Binary referable versus non-referable DR classification is also evaluated.

The segmentation component is assessed using Dice score.

Actual final test results and segmentation metrics should be documented here after verifying the corresponding evaluation outputs.

## Intended Use

This project is developed for academic and research purposes. It is not a clinically validated diagnostic system and should not replace assessment by a qualified eye-care professional.

## Future Improvements

- Improve minority-class classification performance.
- Optimize lesion segmentation accuracy.
- Expand validation on diverse retinal datasets.
- Improve model calibration and explainability.
- Develop a user-friendly screening interface.

## Acknowledgements

This project uses publicly available retinal image datasets, including APTOS 2019 Blindness Detection and IDRiD, for academic experimentation. Please consult the original dataset providers for appropriate attribution and licensing.
