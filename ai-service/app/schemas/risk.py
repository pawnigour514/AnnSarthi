from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .common import BaseAIResponse

class DonationRiskInput(BaseModel):
    foodName: str
    category: str = Field(..., description="cookedMeal, dairyBakery, freshProduce, packagedDry")
    storageMethod: str = Field(..., description="ambient, refrigerated, heated")
    hoursSincePrep: float = Field(..., ge=0.0)
    pickupWindowHours: Optional[float] = 3.0
    packagingType: Optional[str] = "Food Grade Foil / Box"

class ImageMetadataInput(BaseModel):
    url: Optional[str] = ""
    pHash: Optional[str] = None
    blurScore: Optional[float] = None
    brightness: Optional[float] = None

class RiskScreeningRequest(BaseModel):
    donation: DonationRiskInput
    images: List[ImageMetadataInput] = Field(default_factory=list)

class ImageAnalysisResult(BaseModel):
    blurScore: float
    isBlurry: bool
    brightness: float
    isOverOrUnderexposed: bool
    duplicateHashFound: bool
    notes: str

class RiskScreeningResponse(BaseAIResponse):
    riskLevel: str = Field(..., description="LOW, MEDIUM, HIGH")
    score: float = Field(..., ge=0.0, le=100.0)
    requiredAction: str = Field(..., description="AUTO_APPROVE, MANUAL_REVIEW_REQUIRED, REJECT_IMMEDIATELY")
    imageAnalysis: ImageAnalysisResult
