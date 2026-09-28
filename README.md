# AnnSarthi (अन्नसारथी) 🌾🌱
### Smart Food Waste Redistribution Ecosystem
**Smart India Hackathon (SIH26234) — Production-Grade Web Application**

![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_%2B_Tailwind_CSS-16A34A?style=flat-square)
![Node](https://img.shields.io/badge/Backend-Node.js_%2B_Express_%2B_Socket.IO-14532D?style=flat-square)
![Python](https://img.shields.io/badge/AI_Engine-FastAPI_%2B_scikit--learn_%2B_NumPy-0D9488?style=flat-square)
![Database](https://img.shields.io/badge/Database-MongoDB_%2B_In--Memory_Fallback-2563EB?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-17_Backend_%2B_8_AI_Tests_Passing-16A34A?style=flat-square)

---

## 🌟 1. Executive Summary

**AnnSarthi** is an end-to-end, multi-sided food waste redistribution ecosystem engineered for **Smart India Hackathon problem statement SIH26234**. It bridges the divide between surplus-food donors (banquet halls, caterers, hotels, restaurants, corporate cafeterias) and verified receivers (NGOs, orphanages, community kitchens, night shelters), powered by an on-demand fleet of delivery partners.

### 🛡️ Non-Negotiable Core Principles

1. **Non-Negotiable Safety Principle**:
   > **AnnSarthi NEVER claims that AI guarantees food safety.**
   > Microscopic pathogens and spoilage toxins cannot be detected from digital photographs or metadata alone. In AnnSarthi, AI and heuristic screening algorithms serve strictly as **risk screening, anomaly detection, shelf-life verification, prioritization, and decision-support tools**.
   >
   > All items flagged as `MEDIUM` or `HIGH` risk are sequestered into an administrative human review queue (`MANUAL_REVIEW_REQUIRED`). The platform enforces mandatory physical sensory inspection, temperature measurement, and chain-of-custody verification at pickup and handoff under FSSAI surplus food regulations.

2. **Non-Negotiable Honesty Principle**:
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
   > The user interface badges every insight with its exact computation method (`rule-based` vs `ml`), maintaining 100% architectural honesty for judges and operators.

---

## 🚀 2. Quick Demo Access (1-Click Evaluation)

AnnSarthi includes **1-Click Demo Buttons** across the login page and navigation header. Evaluators can seamlessly switch roles without creating accounts:

| Persona | Demo Email | Password | Key Feature Showcase |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@demo.annsarthi.app` | `DemoPassword123!` | 1-Click Surplus Auto-fill, AI Risk Screening Modal, Surplus Forecaster |
| **NGO / Receiver** | `ngo@demo.annsarthi.app` | `DemoPassword123!` | Demand Posting, Compatibility Match Score, Digital Signature Pad |
| **Delivery Courier** | `partner@demo.annsarthi.app` | `DemoPassword123!` | Interactive Leaflet Route, 2-Opt TSP Optimizer, OTP Pickup |
| **Admin / Auditor** | `admin@demo.annsarthi.app` | `DemoPassword123!` | Food Safety Review Queue, Safety Rules Matrix, Append-Only Audit Logs |

- **Universal Demo OTP**: `123456` (or click "Use Demo OTP: 123456" in any modal).
- **Interactive Tour**: Click **"Judge Walkthrough"** in the top navigation bar to launch the guided 6-step evaluator tour overlay.

---

## 🏗️ 3. System Architecture

```mermaid
flowchart TD
    subgraph Frontend["Presentation Layer (client/)"]
        D_UI["Donor Portal<br/>(React 18 + Tailwind)"]
        R_UI["NGO Portal<br/>(React 18 + Tailwind)"]
        P_UI["Delivery Courier Portal<br/>(React 18 + Tailwind)"]
        A_UI["Admin Panel<br/>(React 18 + Tailwind)"]
    end

    subgraph Backend["Application Engine (server/)"]
        API["Express API Gateway (Port 5000)"]
        Auth["JWT Auth & RBAC Guard"]
        FSM["Finite State Machine Engine<br/>(409 Conflict Prevention)"]
        Sockets["Socket.IO Real-Time Dispatch"]
        Audit["Append-Only Audit Service"]
    end

    subgraph AI["AI Microservice (ai-service/)"]
        FastAPI["FastAPI Engine (Port 8000)"]
        RiskMod["CV Risk & Fraud Detection<br/>(Laplacian Blur, Exposure, pHash)"]
        QuantForecast["Quantile Surplus Forecaster<br/>(GradientBoostingRegressor)"]
        TSPOpt["Route Optimizer<br/>(Nearest-Neighbour + 2-Opt)"]
        AnomalyMod["Anti-Fraud Anomaly Detector<br/>(Isolation Forest)"]
    end

    subgraph Database["Persistence Layer"]
        Mongo[("MongoDB Primary Store<br/>(with MongoMemoryServer Fallback)")]
    end

    D_UI & R_UI & P_UI & A_UI <-->|REST & WebSocket| API
    API --> Auth --> FSM --> Mongo
    API --> Audit --> Mongo
    API <-->|Internal HTTP| FastAPI
    FastAPI --> RiskMod & QuantForecast & TSPOpt & AnomalyMod
    Sockets <--> D_UI & R_UI & P_UI
```

---

## 📦 4. Monorepo Project Structure

```
AnnSarthi/
├── client/                     # Frontend SPA (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI library, MapView, Badges, Navigation
│   │   ├── features/
│   │   │   ├── landing/        # Public landing page with live statistics
│   │   │   ├── auth/           # Login & Registration with 1-click demo switcher
│   │   │   ├── donor/          # Overview, Create Donation, History, Forecast, Trust
│   │   │   ├── receiver/       # Overview, Available Food, Demand, Incoming Deliveries
│   │   │   ├── delivery/       # Courier Overview, Available Requests, Active Map, TSP
│   │   │   ├── admin/          # Verifications, Safety Queue, Rules Matrix, Audit Trail
│   │   │   ├── analytics/      # Recharts impact graphs & FAO/UNEP LCA methodology
│   │   │   └── assistant/      # Operations AI Assistant with Human Confirmation Barrier
│   │   ├── store/              # Zustand stores (authStore, demoStore)
│   │   └── App.jsx             # React Query, Router, Protected Guards, Safety Shell
│   ├── nginx.conf              # Production Nginx reverse proxy configuration
│   └── Dockerfile              # Multi-stage client build
│
├── server/                     # Application Backend (Node.js + Express + Socket.IO)
│   ├── src/
│   │   ├── config/             # Environment, DB with auto MongoMemoryServer fallback
│   │   ├── models/             # Mongoose schemas (Donation, SafetyAssessment, etc.)
│   │   ├── controllers/        # Express request handlers
│   │   ├── services/           # Safety, Matching, Delivery, Analytics, Audit services
│   │   ├── middleware/         # Auth, RBAC, Rate Limiting, Error handling
│   │   ├── utils/              # Finite State Machines (409 Conflict), Crypto, Logger
│   │   ├── seed/               # Realistic Indore MP ecosystem seed generator
│   │   └── tests/              # Vitest + Supertest integration test suite (17 passing)
│   └── Dockerfile              # Server container configuration
│
├── ai-service/                 # AI & Analytics Microservice (Python FastAPI)
│   ├── app/
│   │   ├── modules/            # Risk screening, Quantile forecasting, 2-Opt TSP, Anomaly
│   │   ├── routers/            # FastAPI endpoint controllers
│   │   ├── schemas/            # Pydantic v2 validation contracts
│   │   └── tests/              # Pytest test suite (8 passing)
│   └── Dockerfile              # Python FastAPI container
│
├── docs/                       # Technical Documentation
│   ├── architecture.md         # System design, ERD, and state machine diagrams
│   ├── api.md                  # REST API & WebSocket event specification
│   ├── ai-methodology.md       # Model cards, CV pipeline, and ML formulations
│   ├── impact-methodology.md   # FAO / UNEP Life Cycle Assessment (LCA) equations
│   └── demo-script.md          # 5-minute evaluator presentation script
│
├── docker-compose.yml          # Multi-container orchestration (Mongo, Backend, AI, Client)
└── package.json                # Root monorepo scripts & workspaces
```

---

## ⚙️ 5. Getting Started & Local Development

### 5.1 Prerequisites
- **Node.js**: v18.x or v20.x
- **Python**: v3.10+
- **MongoDB**: Optional! *(If local MongoDB is not running, the server automatically boots an in-memory `MongoMemoryServer` zero-config fallback)*.

---

### 5.2 Method A: Run Locally (3 Terminals)

#### Terminal 1: AI Microservice
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
*Health Check: `http://localhost:8000/docs`*

#### Terminal 2: Node.js Backend Server
```bash
cd server
npm install
npm run seed                    # Seeds 40+ Indore donors, NGOs, deliveries & rules
npm run dev
```
*Health Check: `http://localhost:5000/api/v1/health`*

#### Terminal 3: Vite React Frontend
```bash
cd client
npm install
npm run dev
```
*Open Application: `http://localhost:5173`*

---

### 5.3 Method B: Run via Docker Compose

```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000/api/v1`
- AI Microservice: `http://localhost:8000`

---

## 🧪 6. Test Verification

Both test suites are 100% verified and passing:

### 6.1 Backend API & State Machine Tests (Vitest + Supertest)
```bash
npm run test:server
```
**Results: 17 of 17 tests passed**
- ✅ Health endpoint returns 200 with service information
- ✅ 1-Click demo authentication for DONOR, RECEIVER, PARTNER, ADMIN
- ✅ RBAC Guards: DONOR is rejected (403 Forbidden) from accessing Admin routes
- ✅ RBAC Guards: ADMIN is granted access (200) to Admin review routes
- ✅ Food Safety Rules: Active matrix retrieval
- ✅ Food Safety Screening: Safe cooked food evaluated as LOW / MEDIUM risk
- ✅ Food Safety Screening: Expired food flagged as HIGH risk (`MANUAL_REVIEW_REQUIRED`)
- ✅ Strict Finite State Machine: Sequential transitions permitted (`DRAFT` -> `SUBMITTED`)
- ✅ State Machine Conflict: 409 Conflict thrown on illegal jumps (`SUBMITTED` -> `COMPLETED`)
- ✅ State Machine Conflict: 409 Conflict thrown on illegal delivery skips (`ASSIGNED` -> `DELIVERED`)
- ✅ Terminal State Enforcement: Blocks transitions from `COMPLETED`
- ✅ Impact Analytics: Overview KPIs and FAO/UNEP methodology notes
- ✅ Impact Analytics: Monthly trend trajectories
- ✅ AI Assistant: Role-aware operations chat
- ✅ AI Assistant: Enforces Human Write Confirmation barrier for draft actions

### 6.2 AI Microservice Tests (Pytest)
```bash
npm run test:ai
```
**Results: 8 of 8 tests passed**
- ✅ Low-risk food screening with explainable feature contributions
- ✅ High-risk cooked food elapsed time threshold flags
- ✅ Computer Vision Laplacian blur quality detection
- ✅ Quantile Surplus Forecaster ($P_{10}, P_{50}, P_{90}$ bounds)
- ✅ Explainable multi-factor bipartite matching scoring
- ✅ Traveling Salesperson (2-Opt TSP) route distance reduction
- ✅ Unsupervised IsolationForest anomaly detection on volume manipulation
- ✅ FastAPI health check endpoint

### 6.3 Client Build Verification
```bash
npm run build:client
```
- ✅ Clean Vite production build with zero syntax or import errors.

---

## 🔬 7. Impact Accounting Equations (FAO / UNEP LCA)

AnnSarthi calculates environmental savings using peer-reviewed Life Cycle Assessment (LCA) standards:

1. **Greenhouse Gas Emissions ($\text{CO}_2\text{e}$ Avoided)**:
   $$\text{CO}_2\text{e Prevented (kg)} = \text{Food Diverted (kg)} \times 2.5\text{ kg CO}_2\text{e/kg}$$
   *(Includes 1.9 kg avoided landfill methane + 0.6 kg upstream agricultural production footprint)*.

2. **Embedded Virtual Water Conservation**:
   $$\text{Water Conserved (Liters)} = \text{Food Diverted (kg)} \times 850\text{ Liters/kg}$$
   *(Derived from Water Footprint Network data for Indian diet mixes)*.

3. **Landfill Space Conserved**:
   $$\text{Landfill Volume Saved (m}^3\text{)} = \text{Food Diverted (kg)} \times 0.0018\text{ m}^3\text{/kg}$$
   *(Based on municipal compacted waste density of } 550\text{ kg/m}^3)*.

---

## 👥 8. Contributor & Hackathon Details

- **Hackathon**: Smart India Hackathon (SIH 2026)
- **Problem Statement**: SIH26234 — Smart Food Waste Redistribution Ecosystem
- **Focus Region**: Indore, Madhya Pradesh (India's Cleanest City)
- **License**: ISC Open Source License
