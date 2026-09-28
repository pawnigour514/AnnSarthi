from fastapi import APIRouter
from app.schemas.matching import SmartMatchingRequest, SmartMatchingResponse
from app.modules.matching import compute_smart_matches

router = APIRouter(tags=["Smart Matching"])

@router.post("/matching/rank", response_model=SmartMatchingResponse)
def rank_matches(payload: SmartMatchingRequest):
    ranked = compute_smart_matches(payload.model_dump())
    return SmartMatchingResponse(
        rankedMatches=ranked,
        method="rule-based",
        confidence=0.92,
        explanation=["Ranked using explainable composite multi-factor scoring (food type, quantity, distance, time window)."],
        disclaimer="Matching scores indicate feasibility recommendations, not automated commitments.",
    )
