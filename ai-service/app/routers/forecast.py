from fastapi import APIRouter
from app.schemas.forecast import (
    SurplusForecastRequest,
    SurplusForecastResponse,
    DemandForecastRequest,
    DemandForecastResponse,
)
from app.modules.surplus_forecast import surplus_forecaster
from app.modules.demand_forecast import forecast_demand

router = APIRouter(tags=["Predictive Forecasting"])

@router.post("/surplus-forecast", response_model=SurplusForecastResponse)
def get_surplus_forecast(payload: SurplusForecastRequest):
    result = surplus_forecaster.predict(payload.model_dump())
    return SurplusForecastResponse(**result)

@router.post("/demand-forecast", response_model=DemandForecastResponse)
def get_demand_forecast(payload: DemandForecastRequest):
    result = forecast_demand(payload.model_dump())
    return DemandForecastResponse(**result)
