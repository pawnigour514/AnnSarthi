import pytest
from app.modules.risk_screening import screen_food_risk
from app.modules.surplus_forecast import surplus_forecaster
from app.modules.demand_forecast import forecast_demand
from app.modules.matching import compute_smart_matches
from app.modules.routing import optimize_stops
from app.modules.anomaly import anomaly_detector

def test_risk_screening_low_risk():
    donation = {
        "foodName": "Fresh Dal & Rice",
        "category": "cookedMeal",
        "storageMethod": "ambient",
        "hoursSincePrep": 1.5,
        "pickupWindowHours": 2.5,
    }
    images = [{"blurScore": 480, "brightness": 120, "pHash": "fresh_hash_1"}]
    res = screen_food_risk(donation, images)

    assert res["riskLevel"] == "LOW"
    assert res["requiredAction"] == "AUTO_APPROVE"
    assert res["method"] == "rule-based"
    assert "DISCLAIMER" in res["disclaimer"]
    assert len(res["explanation"]) > 0

def test_risk_screening_high_risk_perishable_and_expired():
    donation = {
        "foodName": "Raw Seafood Buffet Leftover",
        "category": "cookedMeal",
        "storageMethod": "ambient",
        "hoursSincePrep": 6.5,
        "pickupWindowHours": 0.2,
    }
    res = screen_food_risk(donation, [])

    assert res["riskLevel"] == "HIGH"
    assert res["requiredAction"] == "MANUAL_REVIEW_REQUIRED"
    assert res["score"] < 60

def test_risk_screening_duplicate_hash():
    donation = {
        "foodName": "Paneer Rice",
        "category": "cookedMeal",
        "storageMethod": "ambient",
        "hoursSincePrep": 1.0,
    }
    images = [{"pHash": "a7b8c9d0e1f23456"}] # Known duplicate hash
    res = screen_food_risk(donation, images)

    assert res["imageAnalysis"]["duplicateHashFound"] is True
    assert any("duplicate" in r.lower() for r in res["explanation"])

def test_surplus_forecasting_quantiles():
    req = {
        "dayOfWeek": 5, # Saturday
        "timeSlot": "DINNER",
        "eventType": "WEDDING",
        "expectedGuests": 350,
    }
    res = surplus_forecaster.predict(req)

    assert res["method"] == "ml"
    assert res["upperBoundMeals"] >= res["lowerBoundMeals"]
    assert res["predictedSurplusMeals"] > 0
    assert res["suggestedPreparationAdjustmentKg"] > 0
    assert len(res["explanation"]) >= 3

def test_demand_forecasting():
    req = {
        "area": "Vijay Nagar",
        "dayOfWeek": 6,
        "hourOfDay": 20,
        "registeredReceiversCount": 6,
    }
    res = forecast_demand(req)

    assert res["predictedDemandMeals"] > 100
    assert res["urgencyLevel"] == "HIGH"
    assert "Dinner" in res["peakWindow"]

def test_smart_matching_scoring():
    req = {
        "donationMeals": 100,
        "foodCategory": "cookedMeal",
        "dietType": "VEG",
        "pickupCoords": [75.8577, 22.7196],
        "pickupDeadlineHours": 3.0,
        "receivers": [
            {
                "id": "rec_close",
                "coords": [75.8650, 22.7220], # ~1 km
                "capacityMeals": 120,
                "dietPreference": "VEG",
                "urgency": "HIGH",
            },
            {
                "id": "rec_far",
                "coords": [75.9800, 22.8200], # ~18 km
                "capacityMeals": 20,
                "dietPreference": "NON_VEG",
                "urgency": "LOW",
            },
        ],
    }
    matches = compute_smart_matches(req)

    assert len(matches) == 2
    assert matches[0]["receiverId"] == "rec_close"
    assert matches[0]["matchScore"] > matches[1]["matchScore"]
    assert "factorBreakdown" in matches[0]

def test_routing_2opt():
    stops = [
        {"id": "s1", "name": "Hub", "coords": [75.85, 22.71]},
        {"id": "s2", "name": "Stop A", "coords": [75.89, 22.75]},
        {"id": "s3", "name": "Stop B", "coords": [75.87, 22.73]},
        {"id": "s4", "name": "Stop C", "coords": [75.86, 22.72]},
    ]
    res = optimize_stops(stops)

    assert len(res["orderedStopIds"]) == 4
    assert res["totalDistanceKm"] > 0
    assert res["estimatedDurationMinutes"] > 0

def test_anomaly_detection():
    # Abnormal account: 60% cancellations, 40% safety rejections, 3 incidents
    suspicious_account = {
        "accountId": "user_bad",
        "role": "DONOR",
        "totalListings": 10,
        "cancellationsCount": 6,
        "safetyRejectionsCount": 4,
        "averagePickupDelayMinutes": 45.0,
        "reportedIncidentsCount": 3,
        "consecutiveRejections": 3,
    }
    res = anomaly_detector.check_account_anomaly(suspicious_account)

    assert res["isAnomaly"] is True
    assert res["anomalyScore"] > 0.5
    assert len(res["flaggedReasons"]) > 0
    assert res["suggestedAdminAction"] == "FLAG_FOR_OPERATIONS_AUDIT"
