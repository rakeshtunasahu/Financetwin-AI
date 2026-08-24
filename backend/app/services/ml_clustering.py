from typing import List, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from backend.app.models.reconciliation import ExceptionRecord
from backend.app.utils.money import to_decimal

def run_anomaly_detection_and_clustering(exceptions: List[ExceptionRecord]) -> List[Dict[str, Any]]:
    """
    Applies IsolationForest for anomaly detection and DBSCAN for pattern clustering
    on the current reconciliation ExceptionRecord entries.
    """
    if not exceptions:
        return []
        
    if len(exceptions) < 3:
        # Not enough exceptions to fit models, return fallback
        results = []
        for exc in exceptions:
            results.append({
                "exception_id": exc.exception_id,
                "anomaly_score": 0.0,
                "anomaly_flag": 0,
                "cluster_id": -1
            })
        return results
        
    # Extract numerical features for unsupervised learning
    # Features:
    # 1. Expected Amount
    # 2. Variance Amount
    # 3. Days Delayed
    # 4. Severity score (LOW=1, MEDIUM=2, HIGH=3, CRITICAL=4)
    severity_map = {"LOW": 1.0, "MEDIUM": 2.0, "HIGH": 3.0, "CRITICAL": 4.0}
    
    X = []
    for exc in exceptions:
        exp = float(to_decimal(exc.expected_amount))
        var = float(to_decimal(exc.variance))
        
        days = 0.0
        if exc.bank_transaction and exc.settlement_batch:
            days = float(abs((exc.bank_transaction.transaction_date - exc.settlement_batch.expected_credit_date).days))
            
        sev_num = severity_map.get(exc.severity.upper(), 1.0)
        
        X.append([exp, var, days, sev_num])
        
    X_arr = np.array(X)
    
    # 1. Standardize the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_arr)
    
    # 2. Isolation Forest (Anomaly Flag & Score)
    # Contamination defines the proportion of outliers in the dataset
    clf = IsolationForest(contamination=0.15, random_state=42)
    preds = clf.fit_predict(X_scaled)  # 1 for inliers, -1 for outliers
    scores = clf.decision_function(X_scaled)  # lower values are more anomalous
    
    # 3. DBSCAN Clustering
    # eps=1.2 allows grouping of close anomalies (such as repeated settlement delays)
    # min_samples=2 forms clusters for matching anomaly patterns
    db = DBSCAN(eps=1.2, min_samples=2)
    clusters = db.fit_predict(X_scaled)
    
    results = []
    for idx, exc in enumerate(exceptions):
        # Normalize decision score to an anomaly probability (0 to 1)
        # Outliers have negative scores; normal points have positive scores
        raw_score = float(-scores[idx])
        normalized_score = max(0.0, min(1.0, (raw_score + 0.5) / 1.0))
        
        results.append({
            "exception_id": exc.exception_id,
            "anomaly_score": normalized_score,
            "anomaly_flag": 1 if preds[idx] == -1 else 0,
            "cluster_id": int(clusters[idx])
        })
        
    return results
