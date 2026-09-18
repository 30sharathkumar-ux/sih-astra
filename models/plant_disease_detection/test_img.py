import os
from pathlib import Path
import cv2
from ultralytics import YOLO

# define and create folder paths
TEST_DIR = Path("models/plant_disease_detection/test_images")
RESULTS_DIR = Path("models/plant_disease_detection/results")
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# load trained YOLOv8 model
model = YOLO("models/plant_disease_detection/plant_disease_detection_model.pt")

# process each image in the test folder
image_paths = [p for p in TEST_DIR.iterdir()]

for img_path in image_paths:
    # resize image
    img = cv2.imread(str(img_path))
    if img is None:
        print(f"Skipping corrupt image: {img_path.name}")
        continue
    
    resized_img = cv2.resize(img, (416, 416), interpolation=cv2.INTER_AREA)

    # run prediction
    results = model.predict(source=resized_img, imgsz=416, conf=0.25, verbose=False)

    # get annotated image (array) and save to results folder
    annotated_img = results[0].plot()
    save_path = RESULTS_DIR / f"result_{img_path.name}"
    cv2.imwrite(str(save_path), annotated_img)

    print(f"Processed: {img_path.name} -> Saved to: {save_path}")

print(f"\nCompleted! All results saved in '{RESULTS_DIR}'.")
