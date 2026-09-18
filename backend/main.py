from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="SIH Astra AgriTech API")

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
