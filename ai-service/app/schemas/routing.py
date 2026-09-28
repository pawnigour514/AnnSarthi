from pydantic import BaseModel, Field
from typing import List, Optional
from .common import BaseAIResponse

class GeoStop(BaseModel):
    id: str
    name: str
    type: str = Field(..., description="PICKUP, DROP, WAREHOUSE")
    coords: List[float] = Field(..., description="[longitude, latitude]")
    demandKg: Optional[float] = 0.0

class RouteOptimizationRequest(BaseModel):
    stops: List[GeoStop]
    vehicleCapacityKg: Optional[float] = 50.0

class RouteOptimizationResponse(BaseAIResponse):
    orderedStopIds: List[str]
    orderedStops: List[GeoStop]
    totalDistanceKm: float
    estimatedDurationMinutes: float
    polyline: Optional[str] = ""
    algorithm: str = Field(default="Nearest-Neighbour + 2-Opt Heuristic")
