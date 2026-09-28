from fastapi import APIRouter
from app.schemas.routing import RouteOptimizationRequest, RouteOptimizationResponse
from app.modules.routing import optimize_stops

router = APIRouter(tags=["Multi-Stop Routing"])

@router.post("/routing/optimize", response_model=RouteOptimizationResponse)
def get_optimized_route(payload: RouteOptimizationRequest):
    result = optimize_stops([s.model_dump() for s in payload.stops])
    return RouteOptimizationResponse(**result)
