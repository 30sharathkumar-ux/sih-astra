import cv2
import numpy as np
import urllib.request
from ultralytics import YOLO

# 1. Configuration
ESP32_IP = "192.168.1.100"  # Replace with your ESP32-CAM's IP address
STREAM_URL = f"http://{ESP32_IP}:81/stream"  # Standard stream endpoint for CameraWebServer example

# 2. Load trained model
model = YOLO("best.pt")

print(f"Connecting to ESP32 stream at {STREAM_URL}...")

try:
    # Open the network stream
    stream = urllib.request.urlopen(STREAM_URL)
    bytes_buffer = b""

    while True:
        # Read byte chunks from the network stream
        bytes_buffer += stream.read(1024)
        
        # Search for JPEG frame boundaries
        a = bytes_buffer.find(b"\xff\xd8")  # Start of JPEG frame
        b = bytes_buffer.find(b"\xff\xd9")  # End of JPEG frame

        if a != -1 and b != -1:
            jpg_data = bytes_buffer[a : b + 2]
            bytes_buffer = bytes_buffer[b + 2 :]

            # Decode JPEG binary data to OpenCV matrix
            frame = cv2.imdecode(np.frombuffer(jpg_data, dtype=np.uint8), cv2.IMREAD_COLOR)

            if frame is None:
                continue

            # Resize frame to 416x416 matching model input
            resized_frame = cv2.resize(frame, (416, 416), interpolation=cv2.INTER_AREA)

            # Run YOLOv8 detection
            results = model.predict(source=resized_frame, imgsz=416, conf=0.25, verbose=False)

            # Draw bounding box results on the frame
            annotated_frame = results[0].plot()

            # Display real-time video feed
            cv2.imshow("ESP32-CAM YOLOv8 Live Detection", annotated_frame)

            # Press 'q' to stop execution
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

except Exception as e:
    print(f"Connection error: {e}")

finally:
    cv2.destroyAllWindows()