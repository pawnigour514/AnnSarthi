import math
from typing import List, Dict, Any

def haversine_distance(coord1: List[float], coord2: List[float]) -> float:
    lon1, lat1 = coord1
    lon2, lat2 = coord2
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def compute_smart_matches(req: Dict[str, Any]) -> List[Dict[str, Any]]:
    donation_meals = req.get("donationMeals", 100)
    category = req.get("foodCategory", "cookedMeal")
    diet = req.get("dietType", "VEG")
    pickup_coords = req.get("pickupCoords", [75.8577, 22.7196])
    hours_left = req.get("pickupDeadlineHours", 4.0)
    receivers = req.get("receivers", [])

    results = []

    for r in receivers:
        rec_id = r.get("id") or r.get("receiverId", "unknown")
        rec_coords = r.get("coords", [75.87, 22.72])
        rec_cap = r.get("capacityMeals", 200)
        rec_diet = r.get("dietPreference", "ANY")
        rec_urgency = r.get("urgency", "MEDIUM")

        dist_km = haversine_distance(pickup_coords, rec_coords)

        # 1. Food type / diet compatibility (0 to 100)
        food_type_score = 100.0 if (rec_diet == "ANY" or rec_diet == diet) else 40.0

        # 2. Quantity fit (0 to 100)
        ratio = donation_meals / max(1.0, float(rec_cap))
        if 0.5 <= ratio <= 1.2:
            quantity_score = 100.0
        elif ratio < 0.5:
            quantity_score = max(40.0, ratio * 200.0)
        else:
            quantity_score = max(50.0, 100.0 - (ratio - 1.2) * 50.0)

        # 3. Distance score (0 to 100)
        distance_score = max(20.0, min(100.0, 100.0 - dist_km * 4.0))

        # 4. Time window score
        time_score = 100.0 if hours_left >= 2.5 else (70.0 if hours_left >= 1.0 else 40.0)

        # 5. Capacity score
        cap_score = 100.0 if rec_cap >= donation_meals else 80.0

        urgency_bonus = 5.0 if rec_urgency == "HIGH" else 0.0

        composite_score = round(
            food_type_score * 0.25 +
            quantity_score * 0.25 +
            distance_score * 0.30 +
            time_score * 0.10 +
            cap_score * 0.10 +
            urgency_bonus
        )
        composite_score = min(100.0, composite_score)

        explanation = (
            f"{int(composite_score)}% match: {dist_km} km distance ({int(distance_score)}%), "
            f"Diet & category fit ({int(food_type_score)}%), Quantity match ({int(quantity_score)}%), "
            f"Delivery window feasibility ({int(time_score)}%)."
        )

        results.append({
            "receiverId": rec_id,
            "matchScore": composite_score,
            "factorBreakdown": {
                "foodTypeScore": food_type_score,
                "quantityFitScore": quantity_score,
                "distanceScore": distance_score,
                "distanceKm": dist_km,
                "timeWindowScore": time_score,
                "capacityScore": cap_score,
            },
            "explanationText": explanation,
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)
    return results
