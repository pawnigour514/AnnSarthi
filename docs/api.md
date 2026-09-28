# AnnSarthi REST API & Real-Time Socket Specification
**Smart Food Waste Redistribution Ecosystem (SIH26234)**

---

## 1. General Conventions

- **Base URL**: `http://localhost:5000/api/v1`
- **Content Type**: `application/json`
- **Authentication**: `Authorization: Bearer <accessToken>` or HttpOnly session cookie
- **Standard Response Envelope**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```
- **Error Response Envelope**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | CONFLICT | UNAUTHORIZED | FORBIDDEN | NOT_FOUND",
    "message": "Descriptive reason for failure",
    "details": []
  }
}
```

---

## 2. Authentication & Identity Endpoints

### `POST /auth/register`
Creates a new account with role-specific profile details.
- **Request Body**:
```json
{
  "name": "Grand Imperial Banquet",
  "email": "events@grandimperial.in",
  "password": "SecurePassword123!",
  "role": "DONOR",
  "phone": "+919876543210",
  "profileData": {
    "organizationName": "Grand Imperial Hall",
    "donorType": "BANQUET_HALL",
    "fssaiLicenseNumber": "11421850000123",
    "address": { "street": "Ring Road", "city": "Indore", "state": "MP", "pincode": "452010" },
    "coordinates": [75.8937, 22.7533]
  }
}
```
- **Response**: `201 Created` with `{ user, accessToken }`.

### `POST /auth/login`
Authenticates existing credentials.
- **Request Body**: `{ "email": "donor@demo.annsarthi.app", "password": "DemoPassword123!" }`
- **Response**: `200 OK` with `{ user, accessToken }`.

### `POST /auth/demo-login` *(1-Click Evaluation Access)*
Instantly grants an authenticated session as any platform persona without credentials.
- **Request Body**: `{ "role": "DONOR" | "RECEIVER" | "DELIVERY_PARTNER" | "ADMIN" }`
- **Response**: `200 OK` with `{ user, accessToken }`.

### `GET /auth/me`
Retrieves authenticated user details and active profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with `{ user, profile }`.

---

## 3. Food Donation & Safety Screening

### `POST /donations`
Submits a new food donation listing and automatically initiates the multi-layer safety screening pipeline.
- **Headers**: `Authorization: Bearer <token>` (DONOR or ADMIN)
- **Request Body**:
```json
{
  "foodName": "Fresh Vegetable Biryani & Paneer Curry",
  "category": "cookedMeal",
  "dietType": "VEG",
  "quantity": 30,
  "unit": "kg",
  "estimatedMeals": 75,
  "preparationDateTime": "2026-09-28T14:30:00.000Z",
  "storageMethod": "refrigerated",
  "packagingType": "Food Grade Foil / Box",
  "pickupDeadline": "2026-09-28T21:00:00.000Z",
  "images": [{ "url": "/uploads/biryani_sample.jpg" }],
  "notes": "Kept strictly in thermo-insulated food-grade warmers."
}
```
- **Response**: `201 Created` with:
```json
{
  "success": true,
  "data": {
    "donation": { "_id": "...", "status": "VERIFIED", ... },
    "assessment": {
      "riskLevel": "LOW",
      "score": 95,
      "method": "rule-based",
      "confidence": 0.96,
      "reasons": ["All baseline food-safety screening checks passed with high confidence."],
      "requiredAction": "AUTO_APPROVE"
    }
  }
}
```

### `GET /donations`
Lists food donations with optional filtering by status, donor, or date.
- **Query Params**: `?status=VERIFIED&limit=20`

### `GET /donations/:id`
Retrieves complete listing details, food safety assessment scorecard, and active match/delivery status.

### `PATCH /donations/:id/cancel`
Cancels an uncollected donation.

---

## 4. Food Safety Matrix & Admin Review Queue

### `GET /safety/rules`
Returns currently active policy thresholds (shelf-life hours by category, minimum pickup windows, packaging constraints).

### `PUT /safety/rules` *(ADMIN only)*
Modifies conservative food safety thresholds with mandatory audit logging.
- **Request Body**:
```json
{
  "shelfLifeMatrixHours": {
    "cookedMeal": { "ambient": 3.5, "refrigerated": 24, "heated": 6 }
  },
  "minPickupWindowHours": 1.0,
  "autoVerifyLowRisk": true
}
```

### `GET /safety/reviews` *(ADMIN only)*
Retrieves all items flagged as `HIGH` or `MEDIUM` risk awaiting physical inspection or supervisor triage.

### `POST /safety/reviews/:id/decision` *(ADMIN only)*
Submits an administrative adjudication.
- **Request Body**:
```json
{
  "decision": "APPROVED" | "REJECTED" | "REQUEST_MORE_INFO" | "HOLD",
  "reason": "Inspected laboratory thermometer log and batch timestamp photograph; approved for immediate distribution."
}
```

---

## 5. Receiver Requirements & Smart Matching

### `POST /matches/requirements` *(RECEIVER only)*
Publishes an urgent demand request from a shelter or community kitchen.
- **Request Body**:
```json
{
  "foodCategory": "cookedMeal",
  "dietPreference": "VEG",
  "requiredMeals": 50,
  "urgency": "URGENT",
  "neededBy": "2026-09-28T20:00:00.000Z",
  "notes": "Evening distribution for transit children shelter."
}
```

### `POST /matches/auto-match/:donationId`
Computes explainable compatibility scores against active receiver demands.
- **Response**:
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "receiverId": "...",
        "compatibilityScore": 94,
        "scoreBreakdown": {
          "distanceScore": 90,
          "capacityFitScore": 100,
          "urgencyScore": 95,
          "dietComplianceScore": 100
        },
        "distanceKm": 3.2
      }
    ]
  }
}
```

---

## 6. Delivery Logistics & Chain-of-Custody Verification

### `GET /deliveries/available` *(DELIVERY_PARTNER only)*
Lists unassigned deliveries within the courier's serviceable radius.

### `POST /deliveries/:id/accept`
Accepts a transport request. Generates cryptographically secure 6-digit OTPs for pickup and dropoff.

### `POST /deliveries/:id/verify-pickup-otp`
Enforces physical presence at donor site before custody transfer.
- **Request Body**: `{ "otp": "123456", "measuredTemperatureCelsius": 62.5 }`

### `POST /deliveries/:id/verify-delivery-otp`
Confirms receipt at the NGO shelter with digital signature pad capture.
- **Request Body**:
```json
{
  "otp": "123456",
  "recipientSignatureUrl": "data:image/png;base64,...",
  "deliveryNotes": "All 75 meal packets received hot and intact."
}
```

### `POST /deliveries/optimize-route` *(FastAPI 2-Opt TSP)*
Optimizes multi-stop courier itineraries to minimize travel time and carbon emissions.
- **Request Body**:
```json
{
  "depot": [75.8824, 22.7244],
  "waypoints": [
    { "id": "P1", "coords": [75.8937, 22.7533], "type": "PICKUP" },
    { "id": "P2", "coords": [75.8577, 22.7196], "type": "PICKUP" },
    { "id": "D1", "coords": [75.8654, 22.6922], "type": "DROPOFF" }
  ]
}
```
- **Response**: Ordered itinerary with total distance and calculated km saved.

---

## 7. Ecosystem Impact Analytics

### `GET /analytics/overview`
Retrieves cumulative, peer-reviewed LCA environmental and social KPIs:
```json
{
  "metrics": {
    "totalMealsRedistributed": 18450,
    "totalFoodDivertedKg": 7750,
    "estimatedCo2SavedKg": 19375,
    "estimatedWaterSavedLiters": 6587500,
    "estimatedLandfillSavedM3": 13.9,
    "ecosystemParticipants": { "donors": 16, "receivers": 14, "partners": 18 }
  },
  "methodologyNote": {
    "emissionFactor": "2.5 kg CO2e / kg food waste (FAO / UNEP FWF)",
    "waterFactor": "850 L / kg food waste (WRI Virtual Water Accounting)",
    "disclaimer": "All values are calculated estimates based on standard LCA factors."
  }
}
```

---

## 8. Real-Time Socket.IO Channels

Clients connect to the root namespace with their JWT token:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer <token>' }
});
```

| Event Name | Direction | Payload Structure | Description |
| :--- | :--- | :--- | :--- |
| `donation:status_change` | Server -> Room | `{ donationId, status, timestamp }` | Broadcast to donor & assigned NGO |
| `delivery:assigned` | Server -> Courier | `{ deliveryId, pickupLocation, dropoffLocation }` | Dispatches new pickup job |
| `delivery:location_update` | Courier -> Server | `{ deliveryId, lat, lon, heading }` | Real-time GPS breadcrumb tracking |
| `delivery:status_change` | Server -> All | `{ deliveryId, status, step }` | Updates live milestone stepper |
| `safety:alert` | Server -> Admin | `{ donationId, riskLevel, reason }` | Pushes immediate alert for high-risk triage |
