from fastapi import APIRouter
from app.schemas.anomaly import AnomalyCheckRequest, AnomalyCheckResponse
from app.modules.anomaly import anomaly_detector

router = APIRouter(tags=["Anti-Fraud & Anomaly Detection"])

@router.post("/anomaly/check", response_model=AnomalyCheckResponse)
def check_anomaly(payload: AnomalyCheckRequest):
    result = anomaly_detector.check_account_anomaly(payload.account.model_dump())
    return AnomalyCheckResponse(**result)
