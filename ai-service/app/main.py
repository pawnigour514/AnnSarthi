from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import risk, forecast, matching, routing, anomaly

SHARED_TOKEN = os.getenv("AI_SERVICE_TOKEN", "annsarthi_ai_internal_token_secure_2026")

app = FastAPI(
    title="AnnSarthi AI Microservice",
    description="Explainable Decision-Support & Forecasting Engine for Smart Food Waste Redistribution (SIH26234)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def verify_service_token(request: Request, call_next):
    # Allow docs, openapi.json, and health check without token
    if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()
    if token != SHARED_TOKEN and os.getenv("ENABLE_AUTH", "false").lower() == "true":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing AI Service Bearer Token",
        )
    return await call_next(request)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AnnSarthi AI Service",
        "version": "1.0.0",
        "modelStatus": {
            "surplusForecaster": "initialized",
            "anomalyDetector": "initialized",
            "routingOptimizer": "ready",
            "foodRiskScreening": "ready",
        },
    }

app.include_router(risk.router)
app.include_router(forecast.router)
app.include_router(matching.router)
app.include_router(routing.router)
app.include_router(anomaly.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
