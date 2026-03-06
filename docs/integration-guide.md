# CS ERP Integration Guide

This guide covers integrations with external systems including EDI messaging, API authentication, webhooks, and third-party platforms used in container shipping operations.

## Authentication & API Access

### RS256 JWT Authentication

CS ERP uses asymmetric JWT (RS256) for API authentication. All API requests must include a valid token.

**Token Structure:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenant_id": "tenant-uuid",
  "permissions": ["booking:read", "booking:create", "vessel:manage"],
  "iat": 1700000000,
  "exp": 1700900000,
  "iss": "cs-erp"
}
```

**Access Token:**
- Validity: 15 minutes
- Refresh: Use refresh token before expiry

**Refresh Token:**
- Validity: 30 days
- Rotation: New refresh token issued with each refresh
- Storage: httpOnly cookie (never in localStorage)

**Obtaining Tokens:**

```bash
curl -X POST https://cs-erp.codilla.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password"
  }'

# Response
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": { "id": "...", "email": "..." }
  }
}
```

**Using Access Token:**

```bash
curl https://cs-erp.codilla.ai/api/v1/bookings \
  -H "Authorization: Bearer eyJhbGc..."
```

**Refreshing Token:**

```bash
curl -X POST https://cs-erp.codilla.ai/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "eyJhbGc..." }'
```

## EDI Message Types

### BAPLIE (Bayplan and Stowage Plan Message)

**Purpose:** Submit container stowage plan to port/terminal

**Message Flow:**
1. Vessel completes loading at origin port
2. System generates BAPLIE with container positions on vessel
3. Sent to destination port 48-72 hours before arrival
4. Port uses for pre-planning discharge operations

**Content:**
```
UNB+UNOC:3+SENDER+RECEIVER+DATE+REF'
UNH+MESSAGE-REF+BAPLIE:D:96A:UN'
BGM+340+BAPLIE-NO+9'
DTM+137:DATE:102'
NAD+MS+VESSEL-CODE:::9'
TDT+20+VOYAGE+1++VESSEL-NAME'
LOC+9+PORT-CODE'
CPI+1'
DIM+3+M'
CAP+***'
EQD+CN+CONTAINER-NUMBER'
EQN+1+1+5'
EOF'
UNZ+1+MESSAGE-REF'
```

**Endpoint:**
```
POST /api/v1/edi/baplie
Content-Type: application/json
Authorization: Bearer {token}

{
  "voyageId": "...",
  "portId": "...",
  "containers": [
    {
      "containerNumber": "OOCL1234567",
      "position": "Bay-Row-Tier",
      "weight": 18000,
      "commodity": "General Cargo",
      "hazmat": false
    }
  ]
}
```

### COPARN (Container Pre-Announcement Message)

**Purpose:** Notify port of arriving containers 24-48 hours before arrival

**Content:** Container number, booking reference, shipper, consignee, commodity, weight, equipment

**Endpoint:**
```
POST /api/v1/edi/coparn
Content-Type: application/json
Authorization: Bearer {token}

{
  "voyageId": "...",
  "destPortId": "...",
  "eta": "2026-03-15T08:00:00Z",
  "containers": [
    {
      "containerNumber": "OOCL1234567",
      "bookingRef": "OOCL202601234",
      "shipper": { "name": "...", "address": "..." },
      "consignee": { "name": "...", "address": "..." },
      "commodity": "Cotton Textiles",
      "weight": 18000
    }
  ]
}
```

### IFTMIN (Intermodal Transport Dangerous Goods)

**Purpose:** Transmit dangerous goods declaration for containers

**Content:** UN class, proper shipping name, technical name, packing group, marine pollutant flag

**Endpoint:**
```
POST /api/v1/edi/iftmin
Content-Type: application/json
Authorization: Bearer {token}

{
  "containerNumber": "OOCL1234567",
  "hazmatClass": "3",
  "properShippingName": "Paint",
  "technicalName": "Petroleum distillates",
  "packingGroup": "II",
  "marineMarked": true,
  "quantity": 18000,
  "unit": "kg"
}
```

### CUSCAR (Customs Cargo Report Message)

**Purpose:** Electronic customs manifest submission to authorities

**Required 24-72 hours before vessel arrival**

**Content:**
```
POST /api/v1/edi/cuscar
Content-Type: application/json
Authorization: Bearer {token}

{
  "voyageId": "...",
  "destCountry": "AE",
  "manifest": {
    "vessel": "OOCL ASIA",
    "imo": "9652409",
    "voyage": "W001",
    "eta": "2026-03-15T08:00:00Z",
    "containers": [
      {
        "containerNumber": "OOCL1234567",
        "hsCode": "6209.20.00",
        "description": "Men's Shirts Cotton",
        "weight": 18000,
        "origin": "CN",
        "shipper": "...",
        "consignee": "..."
      }
    ]
  }
}
```

## Webhook Patterns

### Event Subscriptions

Subscribe to system events via webhook callbacks.

**Register Webhook:**
```
POST /api/v1/webhooks
Content-Type: application/json
Authorization: Bearer {token}

{
  "url": "https://your-system.com/webhook",
  "events": ["booking.confirmed", "voyage.arrived", "container.damaged"],
  "active": true
}
```

**Event: Booking Confirmed**
```json
{
  "id": "evt_123",
  "type": "booking.confirmed",
  "timestamp": "2026-03-06T10:00:00Z",
  "data": {
    "bookingId": "...",
    "voyageId": "...",
    "shipper": "...",
    "containers": 2,
    "revenue": 1500000
  }
}
```

**Event: Voyage Arrived**
```json
{
  "id": "evt_456",
  "type": "voyage.arrived",
  "timestamp": "2026-03-15T08:30:00Z",
  "data": {
    "voyageId": "...",
    "vesselName": "OOCL ASIA",
    "port": "AEDXB",
    "ata": "2026-03-15T08:30:00Z",
    "containersLoaded": 580
  }
}
```

**Event: Container Damaged**
```json
{
  "id": "evt_789",
  "type": "container.damaged",
  "timestamp": "2026-03-15T10:00:00Z",
  "data": {
    "containerNumber": "OOCL1234567",
    "bookingId": "...",
    "severity": "major",
    "description": "Door seal broken"
  }
}
```

### Webhook Signature Verification

All webhook payloads include HMAC-SHA256 signature.

**Header:** `X-Signature: sha256={signature}`

**Verification:**
```javascript
const crypto = require('crypto');
const signature = req.headers['x-signature'];
const body = JSON.stringify(req.body);
const secret = process.env.WEBHOOK_SECRET;

const computed = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

if (computed === signature) {
  // Valid webhook
}
```

## Third-Party System Integrations

### Port Community Systems (PCS)

Integrates with port systems for real-time vessel schedules, berth availability, container movements.

**API Endpoints Consumed:**
- `GET /vessel-schedule` - Vessel ETA/ETD updates
- `POST /berth-booking` - Reserve berth for port call
- `GET /equipment-status` - Container/equipment location tracking

**Configuration:**
```
PORT_COMMUNITY_BASE_URL=https://pcs.dubaiports.ae/api
PORT_COMMUNITY_API_KEY=xyz123
PORT_COMMUNITY_TIMEOUT=30000
```

### Customs Authority Systems

Electronic submission of manifests and declarations.

**Supported Authorities:**
- UAE: General Directorate of Customs (DGC)
- KSA: Saudi Customs (GAZT)
- India: ICEGATE
- Qatar: Hamad Port Authority

**Integration Method:** SOAP/REST API for CUSCAR, manifest clearance, permit validation

**Error Handling:** System retries failed submissions hourly for 24 hours, alerts ops team

### AIS (Automatic Identification System) for Vessel Tracking

Real-time vessel position, speed, heading from AIS data feeds.

**Data Provider:** MarineTraffic or Automatic Tracking System

**Updates:** Every 5-10 minutes per vessel

**Fields Captured:**
- Position (latitude, longitude)
- Speed over ground (knots)
- Heading (degrees)
- Destination port/ETA
- Timestamp

**API Usage:**
```
GET /api/v1/vessel/{vesselId}/position
→ Returns latest AIS position data
```

### Banking & Payment Gateway

Integration with payment processors for freight invoicing and settlements.

**Supported Gateways:**
- Stripe (international)
- PayPal
- Local bank APIs (UAE, India)

**Flows:**
1. Invoice generated on bill of lading issuance
2. Payment link created via gateway API
3. Payment status webhook updates invoice status
4. Revenue recognized in GL

**Configuration:**
```
PAYMENT_GATEWAY=stripe
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email & Communication

SMTP for transactional emails (booking confirmations, B/L release, notifications).

**Configuration:**
```
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_USER=noreply@cs-erp.example
SMTP_PASS={secure}
EMAIL_FROM=noreply@cs-erp.example
```

**Transactional Templates:**
- Booking confirmation
- Bill of lading issued
- Cargo ready for pickup
- Customs clearance required
- Delivery notification
- Demurrage/detention warning

### Analytics & Business Intelligence

Integration with BI tools for reporting and dashboards.

**Supported Tools:**
- Tableau
- PowerBI
- Looker

**Data Export:**
- Daily batch export of transactional data
- Real-time data access via API

**API Endpoint:**
```
GET /api/v1/analytics/dashboard-data?period=month&metrics=revenue,containers,utilization
```

## Rate Limiting & Quotas

All API endpoints enforce rate limits by tenant.

**Standard Limits:**
- List endpoints: 1000 requests/hour
- Mutation endpoints: 100 requests/hour
- EDI submission: 500 messages/day
- Webhook deliveries: 10,000/day

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1700000060
```

**Exceeding Limits:**
- Returns 429 Too Many Requests
- Retry-After header included

## Error Codes

Standard API error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking reference format",
    "details": {
      "bookingRef": "must match pattern [A-Z]{3}[0-9]{11}"
    }
  }
}
```

**Common Codes:**
- `AUTH_INVALID_TOKEN` - Token expired or invalid
- `AUTH_MISSING_PERMISSION` - User lacks required permission
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource state prevents operation
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Data Synchronization

### Outbound Sync

System publishes events to external systems:
- Booking confirmation
- Voyage schedule changes
- Container position updates
- Invoice creation
- Delivery notifications

### Inbound Sync

System subscribes to external updates:
- Vessel AIS position
- Port berth availability
- Customs clearance status
- Payment confirmations

### Sync Frequency

- Real-time: Vessel position, customs status
- Hourly: Port schedules, equipment status
- Daily: Financial reconciliation, BI exports
- On-demand: Ad-hoc data exports, API queries

## Testing Integrations

Use Postman collection (available in `/docs/postman-collection.json`) to test:
- Authentication flows
- EDI message submission
- Webhook registration and signature verification
- Third-party API integrations

**Test Environment:**
```
https://staging-cs-erp.codilla.ai/api/v1
```

Staging credentials provided by DevOps team. Test data reset daily at 02:00 UTC.

## Support & Escalation

**Integration Issues:** Email integration-support@codilla.ai

**Incident Response:**
- P1 (system down): 15-minute response
- P2 (data loss risk): 1-hour response
- P3 (degraded): 4-hour response
