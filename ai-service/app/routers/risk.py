from fastapi import APIRouter
from app.schemas.risk import RiskScreeningRequest, RiskScreeningResponse
from app.modules.risk_screening import screen_food_risk

router = APIRouter(tags=["Food Risk Screening"])

@router.post("/risk-screening", response_model=RiskScreeningResponse)
def screen_risk(payload: RiskScreeningRequest):
    result = screen_food_risk(payload.donation.model_dump(), [img.model_dump() for img in payload.images])
    return RiskScreeningResponse(**result)
