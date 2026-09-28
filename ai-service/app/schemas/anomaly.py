from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from .common import BaseAIResponse

class AccountMetrics(BaseModel):
    accountId: str
    role: str
    totalListings: int
    cancellationsCount: int
    safetyRejectionsCount: int
    averagePickupDelayMinutes: float
    reportedIncidentsCount: int
    consecutiveRejections: int

class AnomalyCheckRequest(BaseModel):
    account: AccountMetrics

class AnomalyCheckResponse(BaseAIResponse):
    isAnomaly: bool
    anomalyScore: float = Field(..., description="0.0 normal, 1.0 extreme anomaly")
    flaggedReasons: List[str]
    suggestedAdminAction: str
