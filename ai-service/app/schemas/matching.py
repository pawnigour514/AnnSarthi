from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from .common import BaseAIResponse

class FactorBreakdown(BaseModel):
    foodTypeScore: float
    quantityFitScore: float
    distanceScore: float
    distanceKm: float
    timeWindowScore: float
    capacityScore: float

class MatchCandidate(BaseModel):
    receiverId: str
    matchScore: float
    factorBreakdown: FactorBreakdown
    explanationText: str

class SmartMatchingRequest(BaseModel):
    donationMeals: int
    foodCategory: str
    dietType: str
    pickupCoords: List[float]
    pickupDeadlineHours: float
    receivers: List[Dict]

class SmartMatchingResponse(BaseAIResponse):
    rankedMatches: List[MatchCandidate]
