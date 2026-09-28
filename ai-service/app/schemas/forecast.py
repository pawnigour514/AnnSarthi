from pydantic import BaseModel, Field
from typing import List, Optional
from .common import BaseAIResponse

class SurplusForecastRequest(BaseModel):
    dayOfWeek: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    timeSlot: str = Field(..., description="LUNCH, DINNER, LATE_NIGHT")
    eventType: Optional[str] = "REGULAR"
    expectedGuests: int = Field(..., ge=1)
    historicalAvgMeals: Optional[float] = 120.0
    season: Optional[str] = "NORMAL"

class SurplusForecastResponse(BaseAIResponse):
    predictedSurplusMeals: float
    lowerBoundMeals: float
    upperBoundMeals: float
    confidenceInterval: str
    suggestedPreparationAdjustmentKg: float

class DemandForecastRequest(BaseModel):
    area: str = Field(..., description="E.g. Vijay Nagar, Palasia, Rajwada")
    dayOfWeek: int = Field(..., ge=0, le=6)
    hourOfDay: int = Field(..., ge=0, le=23)
    registeredReceiversCount: int = Field(default=5, ge=1)

class DemandForecastResponse(BaseAIResponse):
    area: str
    predictedDemandMeals: float
    peakWindow: str
    urgencyLevel: str
