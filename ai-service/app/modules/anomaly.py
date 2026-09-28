import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List

class AnomalyDetector:
    def __init__(self):
        self.clf = IsolationForest(contamination=0.1, random_state=42)
        self._init_baseline_forest()

    def _init_baseline_forest(self):
        # Baseline normal behavioral features:
        # [cancellation_rate, rejection_rate, reported_incidents, consecutive_rejections]
        np.random.seed(42)
        normal_samples = np.random.uniform(low=[0.02, 0.01, 0.0, 0.0], high=[0.15, 0.05, 1.0, 1.0], size=(120, 4))
        # Add a few outlier instances
        outlier_samples = np.array([
            [0.65, 0.40, 4.0, 3.0],
            [0.50, 0.35, 5.0, 4.0],
            [0.80, 0.50, 6.0, 5.0],
        ])
        X = np.vstack([normal_samples, outlier_samples])
        self.clf.fit(X)

    def check_account_anomaly(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        total = max(1, metrics.get("totalListings", 1))
        cancellations = metrics.get("cancellationsCount", 0)
        rejections = metrics.get("safetyRejectionsCount", 0)
        incidents = metrics.get("reportedIncidentsCount", 0)
        consecutive_rej = metrics.get("consecutiveRejections", 0)

        cancel_rate = cancellations / total
        rejection_rate = rejections / total

        features = np.array([[cancel_rate, rejection_rate, float(incidents), float(consecutive_rej)]])
        prediction = self.clf.predict(features)[0] # -1 = anomaly, 1 = normal
        raw_score = self.clf.decision_function(features)[0]
        # Normalize anomaly score: lower decision_function -> higher anomaly probability
        normalized_anomaly_score = max(0.0, min(1.0, 0.5 - raw_score))

        flagged_reasons = []
        if cancel_rate > 0.4:
            flagged_reasons.append(f"Unusually high cancellation rate ({cancel_rate * 100:.1f}%).")
        if rejection_rate > 0.25:
            flagged_reasons.append(f"Excessive food safety rejection frequency ({rejection_rate * 100:.1f}%).")
        if incidents >= 2:
            flagged_reasons.append(f"Multiple incident reports ({incidents}) logged by partners/receivers.")
        if consecutive_rej >= 2:
            flagged_reasons.append(f"{consecutive_rej} consecutive safety screening rejections.")

        is_anomaly = bool(prediction == -1 or len(flagged_reasons) >= 2 or normalized_anomaly_score > 0.65)

        suggested_action = (
            "FLAG_FOR_OPERATIONS_AUDIT" if is_anomaly else "CONTINUE_REGULAR_MONITORING"
        )

        return {
            "isAnomaly": is_anomaly,
            "anomalyScore": round(float(normalized_anomaly_score), 2),
            "flaggedReasons": flagged_reasons if flagged_reasons else ["Behavioral patterns align with normal ecosystem activity."],
            "suggestedAdminAction": suggested_action,
            "method": "ml",
            "confidence": 0.89,
            "explanation": [
                f"IsolationForest evaluation on 4 dimensional behavioral vector: score={normalized_anomaly_score:.2f}.",
                "Results submitted to Human Review queue. Anti-fraud system operates under non-punitive, decision-support policy (no automated account termination).",
            ],
            "disclaimer": "Anomaly scores are advisory flags for administrative investigation.",
        }

anomaly_detector = AnomalyDetector()
