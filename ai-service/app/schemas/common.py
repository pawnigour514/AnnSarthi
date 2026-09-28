from pydantic import BaseModel, Field
from typing import List, Any, Optional

class BaseAIResponse(BaseModel):
    method: str = Field(..., description="Method used: 'rule-based' or 'ml'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0 to 1.0")
    explanation: List[str] = Field(default_factory=list, description="List of transparent human-readable explanations")
    disclaimer: Optional[str] = Field(None, description="Persistent safety or probabilistic disclaimer")
