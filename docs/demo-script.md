# AnnSarthi 5-Minute Evaluator & Judge Walkthrough Guide
**Smart India Hackathon (SIH26234) — Demonstration Script**

---

## 1. Quick Access & Credentials

The platform includes built-in **1-Click Demo Switchers** on the login page and navigation topbar. No typing is required!

| Role | Demo Email | Password | Primary Feature Highlight |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@demo.annsarthi.app` | `DemoPassword123!` | AI Risk Screening, Surplus Forecaster, Trust Score |
| **Receiver (NGO)** | `ngo@demo.annsarthi.app` | `DemoPassword123!` | Demand Posting, Match Scoring, Digital Signature Confirmation |
| **Delivery Courier** | `partner@demo.annsarthi.app` | `DemoPassword123!` | Active Map Route, 2-Opt TSP Optimizer, OTP Pickup |
| **Administrator** | `admin@demo.annsarthi.app` | `DemoPassword123!` | Food Safety Review Queue, Safety Rules Matrix, Audit Logs |

> **Evaluation Tip**: Click the **"Judge Walkthrough"** button in the top navigation bar at any point to enable the guided floating tour overlay.
> **Universal Demo OTP**: `123456` (or click "Use Demo OTP: 123456" in the modal).

---

## 2. Five-Minute Presentation Script

### Minute 0:00 - 0:45: The Problem & Landing Page
1. Open `http://localhost:5173/` (or production host).
2. Point out:
   - AnnSarthi’s multi-sided architecture addressing **SIH26234**.
   - Clear declaration of the **Non-Negotiable Food Safety Principle**: AI is an advisory screening and anomaly-detection tool, not a chemical guarantee.
   - Live ecosystem stats across Indore (18,450+ meals delivered, 19+ tonnes CO2e avoided).
3. Click **"Launch Demo"** or **"Sign In"** -> click the **"Donor"** quick button.

---

### Minute 0:45 - 1:45: Donor Experience & AI Risk Screening
1. On the **Donor Overview** (`/donor`), view active listings, recent handoffs, and donor reputation badge (96 Trust Score).
2. Click **"Create Donation"** (`/donor/create`):
   - Click the green **"Fill Demo Surplus Data"** button to auto-populate a wedding feast donation (Vegetable Biryani, 30 kg, refrigerated).
   - Click **"Submit for Safety Screening"**.
3. Observe the **Food Safety Risk Screening Modal**:
   - Transparently shows method: **`rule-based`** or **`ml`**.
   - Displays blur detection, exposure check, and time-temperature shelf-life validation.
   - Shows **LOW RISK (Score 95/100)** with auto-verification.
4. Click **"Surplus Forecast"** (`/donor/forecast`):
   - Show the Quantile GradientBoostingRegressor predicting expected surplus meals before future events.

---

### Minute 1:45 - 2:45: NGO Matching & Demand Insights
1. In the Topbar **Demo Switch**, select **"NGO / Receiver"**.
2. On **Available Food** (`/receiver/available`):
   - Notice the listing just created by the donor appears with an explainable compatibility match score (e.g. 96% match).
   - Click to inspect the score breakdown: Distance (92), Diet Fit (100), Capacity Fit (98).
3. Go to **"Post Requirement"** (`/receiver/requirement`):
   - Click **"Fill Demo Demand"** to quickly post an urgent evening requirement for 45 shelter meals.
4. Go to **"Incoming Deliveries"** (`/receiver/incoming`):
   - View deliveries in transit with estimated ETA.

---

### Minute 2:45 - 3:45: Courier Dispatch & Chain-of-Custody Handoff
1. In the Topbar **Demo Switch**, select **"Delivery Partner"**.
2. On **Active Delivery** (`/delivery/active`):
   - Interactive Leaflet map shows the live courier route connecting pickup and dropoff points across Indore.
   - Milestone stepper tracks `ACCEPTED` -> `PICKUP_STARTED` -> `PICKED_UP` -> `IN_TRANSIT` -> `DELIVERED`.
3. Test Physical Verification:
   - Click **"Confirm Pickup"** -> Click **"Use Demo OTP"** (fills `123456`) -> Confirm. Status updates to `IN_TRANSIT`.
   - Click **"Route Optimizer"** (`/delivery/route`) to see the **2-Opt TSP algorithm** reordering multi-stop waypoints to save kilometers and emissions.

---

### Minute 3:45 - 4:30: Admin Governance & Food Safety Queue
1. In the Topbar **Demo Switch**, select **"Admin / Reviewer"**.
2. Open **"Food Safety Reviews"** (`/admin/safety-reviews`):
   - Demonstrate the human-in-the-loop review queue for flagged donations.
   - Inspect reasons, image analysis, and temperature logs.
   - Click **"Approve"** with a mandatory auditor rationale.
3. Open **"Safety Rules Matrix"** (`/admin/rules`):
   - Demonstrate how administrators can adjust conservative shelf-life hours per food category.
4. Open **"Audit Log Trail"** (`/admin/audit`):
   - Inspect the tamper-evident, append-only security log recording every state transition.

---

### Minute 4:30 - 5:00: Impact Analytics & AI Operations Assistant
1. Navigate to **"Impact Analytics"** (`/analytics`):
   - Review Recharts visualizations of monthly redistribution trends and category breakdowns.
   - Click **"Audit Methodology"** to show the FAO/UNEP LCA equations ($2.5\text{ kg CO}_2\text{e/kg}$, $850\text{ L/kg}$).
2. Click the floating **Bot** icon in the topbar to summon the **AI Operations Assistant**:
   - Type: *"Create a donation of 40 kg fresh khichdi"*
   - Observe the **Human Write Confirmation Barrier**: the assistant generates a structured draft and refuses to commit without explicit human approval.
3. Conclude demonstration.
