from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

# ── Plant disease detection ────────────────────────────────────────────────────
import io
import numpy as np
from pathlib import Path
from typing import Optional

app = FastAPI(title="SIH Astra AgriTech API")

# CORS Configuration
# Covers common Vite local dev ports (5173–5176) — Vite increments the port
# if the preferred one is already in use.
# On Render, set the ALLOWED_ORIGINS environment variable (comma-separated)
# to add your Vercel domain without touching this file.
_default_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    # ── Deployed Vercel frontend ───────────────────────────────────────────────
    "https://sihastra.vercel.app",
    # Add preview deployments if needed: "https://sih-astra-*.vercel.app"
]

# Optional: extend the list at runtime via a comma-separated env var.
# Example (on Render): ALLOWED_ORIGINS=https://sihastra.vercel.app
_extra = os.getenv("ALLOWED_ORIGINS", "")
origins = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── YOLO model lazy singleton ──────────────────────────────────────────────────
# Model is loaded once on the first prediction request, not at import time.
# This keeps server startup fast and avoids import-time failures if ultralytics
# is not installed in a minimal deployment that only uses the weather endpoint.

_yolo_model = None
_yolo_load_error: Optional[str] = None

# Path is resolved relative to this file so it works regardless of the working
# directory the server is started from.
_MODEL_PATH = (
    Path(__file__).parent.parent
    / "models"
    / "plant_disease_detection"
    / "plant_disease_detection_model.pt"
)


def _get_yolo_model():
    """Return the cached YOLO model, loading it on first call."""
    global _yolo_model, _yolo_load_error

    if _yolo_model is not None:
        return _yolo_model

    if _yolo_load_error:
        raise RuntimeError(_yolo_load_error)

    try:
        from ultralytics import YOLO  # deferred import
        if not _MODEL_PATH.exists():
            _yolo_load_error = f"Model file not found: {_MODEL_PATH}"
            raise RuntimeError(_yolo_load_error)
        _yolo_model = YOLO(str(_MODEL_PATH))
        return _yolo_model
    except ImportError:
        _yolo_load_error = (
            "ultralytics is not installed. "
            "Run: pip install ultralytics opencv-python-headless numpy"
        )
        raise RuntimeError(_yolo_load_error)
    except Exception as exc:
        _yolo_load_error = f"Failed to load YOLO model: {exc}"
        raise RuntimeError(_yolo_load_error)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

@app.get("/api/weather")
async def get_weather(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location")
):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration",
        "timezone": "auto"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(OPEN_METEO_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Extract current weather
            current = data.get("current", {})
            
            # Extract and transform daily weather
            daily = data.get("daily", {})

            def _safe_get(field: str, index: int):
                """Return daily[field][index] or None if field is missing or too short."""
                values = daily.get(field)
                if values is None or index >= len(values):
                    return None
                return values[index]

            daily_forecast = []
            if "time" in daily:
                for i in range(len(daily["time"])):
                    daily_forecast.append({
                        "date": daily["time"][i],
                        "weatherCode": _safe_get("weather_code", i),
                        "temperatureMax": _safe_get("temperature_2m_max", i),
                        "temperatureMin": _safe_get("temperature_2m_min", i),
                        "precipitation": _safe_get("precipitation_sum", i),
                        "precipitationProbability": _safe_get("precipitation_probability_max", i),
                        "et0": _safe_get("et0_fao_evapotranspiration", i)
                    })
            
            return {
                "location": {
                    "latitude": data.get("latitude"),
                    "longitude": data.get("longitude"),
                    "timezone": data.get("timezone")
                },
                "current": {
                    "temperature": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "precipitation": current.get("precipitation"),
                    "weatherCode": current.get("weather_code"),
                    "windSpeed": current.get("wind_speed_10m")
                },
                "daily": daily_forecast
            }
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Open-Meteo API error: {e.response.text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Could not connect to Open-Meteo API: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error while processing weather data: {str(e)}")


# ── Plant Disease Detection ────────────────────────────────────────────────────

@app.post("/api/disease/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Accept an uploaded plant image and run YOLOv8 inference.

    Returns:
      {
        "success": true,
        "detections": [
          { "class": "Early Blight", "confidence": 0.91 }
        ],
        "model_classes": ["Early Blight", "Late Blight", ...]   // all classes the model knows
      }

    On no detection:
      { "success": true, "detections": [] }

    On error:
      HTTP 4xx / 5xx with {"detail": "..."}
    """
    # ── 1. Validate upload ────────────────────────────────────────────────────
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Upload a JPEG, PNG, or WebP image."
        )

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── 2. Decode image bytes → OpenCV array ─────────────────────────────────
    try:
        import cv2  # deferred — only needed at inference time
        img_array = np.frombuffer(raw_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("imdecode returned None")
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not decode the uploaded image: {exc}"
        )

    # ── 3. Resize to match training resolution ────────────────────────────────
    img_resized = cv2.resize(img, (416, 416), interpolation=cv2.INTER_AREA)

    # ── 4. Load model (lazy singleton) ────────────────────────────────────────
    try:
        model = _get_yolo_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    # ── 5. Run inference ──────────────────────────────────────────────────────
    try:
        results = model.predict(
            source=img_resized,
            imgsz=416,
            conf=0.25,
            verbose=False,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"YOLO inference failed: {exc}"
        )

    # ── 6. Parse detections ───────────────────────────────────────────────────
    # Class names come from the model itself — no hard-coding needed.
    class_names = model.names  # dict: {int_id: "class_name", ...}
    all_classes = list(class_names.values())

    detections = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = round(float(box.conf[0].item()), 4)
            disease_name = class_names.get(class_id, f"class_{class_id}")
            detections.append({
                "class": disease_name,
                "confidence": confidence,
            })

    # Sort by confidence descending
    detections.sort(key=lambda d: d["confidence"], reverse=True)

    return {
        "success": True,
        "detections": detections,
        "model_classes": all_classes,
    }
