# AnnSarthi AI & Machine Learning Methodology Document
**Smart Food Waste Redistribution Ecosystem (SIH26234)**

---

## 1. Ethical Governance & Core Principles

### 1.1 Non-Negotiable Safety Principle
> **The platform must NEVER claim that AI guarantees food safety.**
> Microscopic pathogens, toxins, and bacterial spoilage cannot be reliably detected from digital imagery or metadata alone. In AnnSarthi, AI and heuristic algorithms are deployed exclusively for **risk screening, anomaly detection, shelf-life triage, prioritization, and decision support**.
> 
> Any item classified with `MEDIUM` or `HIGH` risk is immediately sequestered into the administrative human review queue (`MANUAL_REVIEW_REQUIRED`). The platform mandates physical sensory inspection, temperature measurement, and chain-of-custody verification at pickup and handoff under FSSAI surplus food regulations.

### 1.2 Non-Negotiable Honesty Principle
> **No Fake AI.**
> Every AI, heuristic, and analytical result returned by the backend explicitly exposes:
> ```json
> {
>   "result": "...",
>   "confidence": 0.94,
>   "method": "rule-based" | "ml",
>   "explanation": [ "Rule or feature contribution details" ]
> }
> ```
> The client user interface transparently badges each output with its exact computational method, ensuring evaluators and operators understand whether a deterministic guideline or a statistical inference produced the decision.

---

## 2. Model 1: Computer Vision Image Screening & Fraud Detection

### Objective
Assess uploaded food photography to ensure adequate visual evidence for human triage and detect fraudulent recycling of stock or historical images.

### Pipeline Architecture
1. **Blur Detection (Variance of Laplacian)**:
   $$\text{Blur Score} = \text{Var}\left(\nabla^2 I\right)$$
   Where $I$ is the grayscale photograph. If the variance is below the threshold ($\theta_{\text{blur}} = 120.0$), the image is flagged as blurry, prompting the donor to capture a clearer photograph.
2. **Exposure & Lighting Integrity**:
   Calculates the average pixel luminance $\mu_L \in [0, 255]$.
   - $\mu_L < 45$: Flagged as underexposed / dark.
   - $\mu_L > 220$: Flagged as washed-out / overexposed.
3. **Perceptual Hashing (pHash) Anti-Fraud Scan**:
   Computes a 64-bit Discrete Cosine Transform (DCT) perceptual hash.
   - Calculates Hamming distance $D_H(\text{hash}_1, \text{hash}_2)$ against historical donation image records.
   - If $D_H \le 8$, the submission is flagged for `DUPLICATE_IMAGE_DETECTED` and routed to the administrative fraud queue.

---

## 3. Model 2: Quantile Surplus Forecaster

### Objective
Help banquet halls, hotels, and corporate cafeterias predict surplus meal volumes before events occur, enabling proactive NGO dispatch rather than reactive emergency dumping.

### Mathematical Formulation
Utilizes `GradientBoostingRegressor` trained with **Quantile Loss**:
$$L_\alpha(y, \hat{y}) = \max\left(\alpha(y - \hat{y}), (1 - \alpha)(\hat{y} - y)\right)$$
Predictions are generated across three quantiles:
- $\alpha = 0.10$ ($P_{10}$: Conservative lower bound)
- $\alpha = 0.50$ ($P_{50}$: Median forecast)
- $\alpha = 0.90$ ($P_{90}$: Upper volume risk estimate)

### Features
1. `day_of_week` (0-6 cyclical encoding: $\sin, \cos$)
2. `event_type` (Wedding banquet, Corporate conference, Festival celebration, College dining)
3. `expected_guests` (Integer guest count)
4. `meal_type` (Lunch buffet, Dinner banquet, High tea)
5. `historical_surplus_rate` (Moving average of donor's previous surplus percentages)

---

## 4. Model 3: Explainable Multi-Factor Bipartite Matching

### Objective
Pair available food donations with nearby NGO shelters and community kitchens to maximize freshness, guarantee dietary compliance, and respect receiver capacity.

### Compatibility Scoring Function
$$S_{\text{total}} = w_d S_{\text{dist}} + w_c S_{\text{cap}} + w_u S_{\text{urg}} + w_{\text{diet}} S_{\text{diet}} + w_{\text{cold}} S_{\text{cold}}$$

Where:
- **Distance Score ($S_{\text{dist}}$)**: Decays with haversine travel distance:
  $$S_{\text{dist}} = \max\left(0, 100 - \frac{\text{Distance (km)}}{15\text{ km}} \times 100\right)$$
- **Capacity Fit Score ($S_{\text{cap}}$)**: Measures ratio of offered meals to NGO capacity. Prevents overwhelming small orphanages.
- **Urgency Score ($S_{\text{urg}}$)**: Higher weight for shelters marked `URGENT` or `CRITICAL`.
- **Diet Compliance ($S_{\text{diet}}$)**: Boolean gate (100 if compliant; 0 if non-compliant with strict religious or vegetarian requirements).
- **Cold-Chain Fit ($S_{\text{cold}}$)**: Verifies whether high-risk perishable items are paired with NGOs possessing commercial refrigeration.

---

## 5. Model 4: Courier Route Optimization (2-Opt TSP)

### Objective
Minimize travel time and vehicle carbon emissions for multi-pickup and multi-dropoff courier runs across Indore urban corridors.

### Algorithm
1. **Initial Solution**: Constructed using a greedy Nearest-Neighbour heuristic starting from the courier's GPS location.
2. **Iterative 2-Opt Edge Reversal**:
   Tests all 2-edge swaps $(i, i+1)$ and $(j, j+1)$ to eliminate crossing paths:
   $$\Delta \text{dist} = \left(d(v_i, v_j) + d(v_{i+1}, v_{j+1})\right) - \left(d(v_i, v_{i+1}) + d(v_j, v_{j+1})\right)$$
   Iterates until no further path reduction is achievable ($\Delta \text{dist} \ge 0$).

---

## 6. Model 5: Unsupervised Anomaly & Abuse Detection

### Objective
Detect suspicious patterns (e.g., dummy donation spam, repeated unfulfilled pickups, volume manipulation).

### Formulation
Employs an `IsolationForest` ensemble ($n_{\text{estimators}} = 100$, contamination rate $= 0.05$) combined with deterministic rule checks:
- Rapid cancellation frequency ($> 3$ cancellations in 24 hours).
- Quantity-to-weight discrepancies ($> 5\text{ kg}$ per reported single meal packet).
- Abnormal geographical teleportation between check-ins.
- Unverified donor accounts posting bulk donations $> 500\text{ kg}$.
