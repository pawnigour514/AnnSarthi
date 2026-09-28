import math
from typing import List, Dict, Any, Optional

DISCLAIMER_TEXT = (
    "DISCLAIMER: AI-assisted risk screening is a decision-support and anomaly-detection tool only. "
    "It does NOT guarantee food safety, microbiological sterility, or detect microscopic pathogens. "
    "Final approval is based on configurable safety rules and authorized human inspection."
)

# Baseline shelf life thresholds (Hours)
SHELF_LIFE_MATRIX = {
    "cookedMeal": {"ambient": 4.0, "refrigerated": 24.0, "heated": 6.0},
    "dairyBakery": {"ambient": 6.0, "refrigerated": 36.0, "heated": 4.0},
    "freshProduce": {"ambient": 48.0, "refrigerated": 96.0, "heated": 12.0},
    "packagedDry": {"ambient": 720.0, "refrigerated": 720.0, "heated": 24.0},
}

HIGH_RISK_KEYWORDS = ["seafood", "fish", "prawn", "crab", "raw poultry", "chicken", "unpasteurized"]

# Known existing hashes for duplicate detection test
KNOWN_IMAGE_HASHES = {
    "a7b8c9d0e1f23456": "Duplicate of previously submitted buffet image #1042",
}

def analyze_image_metadata(images: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Examines image quality flags, blur, and perceptual hashes.
    Transparently notes that image analysis is limited to visual quality and duplication.
    """
    if not images:
        return {
            "blurScore": 0.0,
            "isBlurry": True,
            "brightness": 0.0,
            "isOverOrUnderexposed": True,
            "duplicateHashFound": False,
            "notes": "No image metadata supplied.",
        }

    first_img = images[0]
    blur_score = float(first_img.get("blurScore") or 450.0)
    brightness = float(first_img.get("brightness") or 128.0)
    p_hash = first_img.get("pHash") or ""

    is_blurry = blur_score < 100.0
    is_exposed = brightness < 30.0 or brightness > 230.0
    duplicate_found = p_hash in KNOWN_IMAGE_HASHES

    notes = []
    if is_blurry:
        notes.append("Low image sharpness (potential blur).")
    if is_exposed:
        notes.append("Sub-optimal exposure levels detected.")
    if duplicate_found:
        notes.append(f"Perceptual hash collision with historical image: {p_hash}")
    if not notes:
        notes.append("Image resolution, contrast, and visual sharpness are adequate for verification review.")

    return {
        "blurScore": blur_score,
        "isBlurry": is_blurry,
        "brightness": brightness,
        "isOverOrUnderexposed": is_exposed,
        "duplicateHashFound": duplicate_found,
        "notes": " ".join(notes),
    }

def screen_food_risk(donation_data: Dict[str, Any], images: List[Dict[str, Any]]) -> Dict[str, Any]:
    food_name = donation_data.get("foodName", "").lower()
    category = donation_data.get("category", "cookedMeal")
    storage = donation_data.get("storageMethod", "ambient")
    hours = float(donation_data.get("hoursSincePrep", 0.0))
    window = float(donation_data.get("pickupWindowHours", 3.0))

    reasons = []
    deductions = 0.0

    # 1. Perishable high-risk keywords
    is_high_risk_keyword = any(k in food_name for k in HIGH_RISK_KEYWORDS)
    if is_high_risk_keyword and storage == "ambient" and hours > 2.0:
        deductions += 50.0
        reasons.append(f"Perishable animal protein item exposed to ambient storage for {hours:.1f} hrs.")

    # 2. Shelf-life check
    cat_thresholds = SHELF_LIFE_MATRIX.get(category, SHELF_LIFE_MATRIX["cookedMeal"])
    max_hours = cat_thresholds.get(storage, 4.0)

    if hours > max_hours:
        diff = hours - max_hours
        deductions += min(50.0, 30.0 + diff * 10.0)
        reasons.append(
            f"Preparation elapsed time ({hours:.1f} hrs) exceeds standard safe baseline ({max_hours:.1f} hrs) for {storage} storage."
        )
    else:
        reasons.append(f"Elapsed preparation time ({hours:.1f} hrs) is within allowable baseline limit ({max_hours:.1f} hrs).")

    # 3. Pickup window check
    if window < 0.5:
        deductions += 30.0
        reasons.append("Pickup window is less than 30 minutes, risking transit delay.")

    # 4. Image check
    img_analysis = analyze_image_metadata(images)
    if img_analysis["duplicateHashFound"]:
        deductions += 40.0
        reasons.append("Potential duplicate image detected via perceptual hash comparison.")
    if img_analysis["isBlurry"]:
        deductions += 15.0
        reasons.append("Image is blurry; manual visual verification required.")

    score = max(0.0, min(100.0, 100.0 - deductions))

    if score >= 85.0 and not is_high_risk_keyword and not img_analysis["duplicateHashFound"]:
        risk_level = "LOW"
        required_action = "AUTO_APPROVE"
    elif score >= 60.0:
        risk_level = "MEDIUM"
        required_action = "MANUAL_REVIEW_REQUIRED"
    else:
        risk_level = "HIGH"
        required_action = "MANUAL_REVIEW_REQUIRED"

    return {
        "riskLevel": risk_level,
        "score": score,
        "requiredAction": required_action,
        "method": "rule-based",
        "confidence": 0.95,
        "explanation": reasons,
        "imageAnalysis": img_analysis,
        "disclaimer": DISCLAIMER_TEXT,
    }
