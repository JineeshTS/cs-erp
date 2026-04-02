# CS-ERP Integration Guide

This document covers integrating external systems with CS-ERP via APIs, EDI messaging, webhooks, and third-party platform connections.

---

## API Authentication

### RS256 JWT Authentication

CS-ERP uses asymmetric JWT (RS256) for API authentication. All API requests must include a valid token.

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

- **Access Token:** 15-minute validity; refresh before expiry
- **Refresh Token:** 30-day validity with rotation (new token issued each refresh)
- **Storage:** httpOnly cookies (never in localStorage)

**Obtaining Tokens:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "api-user@company.com",
  "password": "..."
}

# Response
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiI...",
    "refreshToken": "eyJhbGciOiJSUzI1NiI...",
    "user": { "id": "...", "email": "..." }
  }
}
```

**Using Tokens:**

```bash
GET /api/v1/operations-documentation/bookings
Authorization: Bearer eyJhbGciOiJSUzI1NiI...
X-CSRF-Token: {csrf_token}
```

**Refreshing:**

```bash
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGc..." }
```

All mutation requests require `X-CSRF-Token` header.

---

## API Response Format

All endpoints return a consistent format:

```json
// Success (single)
{ "data": { ... } }

// Success (list with cursor pagination)
{
  "data": [ ... ],
  "meta": { "total": 1542, "cursor": "eyJpZCI6Ijc..." }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking date",
    "details": { ... }
  }
}
```

### Pagination

All list endpoints use cursor-based pagination (max 50 per page):

```
GET /api/v1/{module}/records?limit=50&cursor={cursor}
```

---

## Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| List/read endpoints | 1000 requests/hour |
| Mutation endpoints | 100 requests/hour |
| Auth endpoints | 30 requests/minute |
| EDI submission | 500 messages/day |
| Webhook deliveries | 10,000/day |

**Rate Limit Headers:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1700000060
```

Exceeding limits returns `429 Too Many Requests` with `Retry-After` header.

---

## EDI Integration

CS-ERP supports standard maritime EDI message types via the Integration & EDI Layer module.

### Supported Standards

| Standard | Description |
|----------|-------------|
| **UN/EDIFACT** | United Nations EDI standard (primary) |
| **ANSI X12** | North American EDI standard |
| **XML/JSON** | Modern API-based alternatives |

### EDI Message Types

#### Booking & Documentation

| Message | Code | Direction | Description |
|---------|------|-----------|-------------|
| Booking Request | IFTMIN | Inbound | Customer booking request |
| Booking Confirmation | IFTMCS | Outbound | Carrier booking confirmation |
| Shipping Instructions | IFTMBC | Inbound | Customer SI submission |
| Cargo Manifest | CUSCAR | Outbound | Customs cargo declaration |
| Container Release | COREOR | Outbound | Container release order |

#### Vessel & Container

| Message | Code | Direction | Description |
|---------|------|-----------|-------------|
| Bay Plan | BAPLIE | Both | Container stowage positions |
| Container Order | COPARN | Outbound | Container pre-announcement |
| Gate In/Out | CODECO | Inbound | Terminal gate events |
| Container Status | COSCON | Both | Container event updates |

#### Financial

| Message | Code | Direction | Description |
|---------|------|-----------|-------------|
| Invoice | INVOIC | Outbound | Freight invoice |
| Payment Advice | PAYORD | Inbound | Payment notification |
| Credit Note | CREMUL | Outbound | Credit note |

### EDI Endpoints

```
POST /api/v1/edi/baplie     # Bay plan submission
POST /api/v1/edi/coparn      # Container pre-announcement
POST /api/v1/edi/cuscar      # Customs cargo report
POST /api/v1/edi/iftmin      # Dangerous goods declaration
```

### BAPLIE Example

```json
POST /api/v1/edi/baplie
Authorization: Bearer {token}

{
  "voyageId": "...",
  "portId": "...",
  "containers": [
    {
      "containerNumber": "CSEU1234567",
      "position": "Bay-Row-Tier",
      "weight": 18000,
      "commodity": "General Cargo",
      "hazmat": false
    }
  ]
}
```

### CUSCAR Example

```json
POST /api/v1/edi/cuscar
Authorization: Bearer {token}

{
  "voyageId": "...",
  "destCountry": "AE",
  "manifest": {
    "vessel": "CS DOHA",
    "imo": "9652409",
    "voyage": "V042/2026",
    "eta": "2026-03-15T08:00:00Z",
    "containers": [
      {
        "containerNumber": "CSEU1234567",
        "hsCode": "6209.20.00",
        "description": "Cotton Textiles",
        "weight": 18000,
        "origin": "CN",
        "shipper": "...",
        "consignee": "..."
      }
    ]
  }
}
```

### EDI Partner Configuration

Configure EDI partners at **Admin > Integrations > EDI Partners**:

1. Partner identification (GLN, SCAC code)
2. Communication protocol (AS2, SFTP, API)
3. Message types enabled
4. Character encoding (UTF-8, ISO-8859-1)
5. Acknowledgment requirements (CONTRL/997)
6. Retry policy on failure

### EDI Processing Flow

```
Inbound:  External System -> EDI Gateway -> Message Queue -> Parser -> Validator -> CS-ERP
Outbound: CS-ERP -> Generator -> Validator -> Message Queue -> EDI Gateway -> External System
```

All EDI messages are logged with full audit trail including raw message content.

---

## Webhooks

CS-ERP sends real-time event notifications to external systems via webhooks.

### Registering Webhooks

```json
POST /api/v1/webhooks
Authorization: Bearer {token}

{
  "url": "https://your-system.com/webhook",
  "events": ["booking.confirmed", "vessel.arrived", "container.gate_in"],
  "active": true
}
```

### Available Events

| Event | Trigger |
|-------|---------|
| `booking.created` | New booking created |
| `booking.confirmed` | Booking confirmed |
| `booking.cancelled` | Booking cancelled |
| `bl.issued` | Bill of lading issued |
| `bl.released` | Cargo release authorized |
| `container.gate_in` | Container enters terminal |
| `container.gate_out` | Container exits terminal |
| `container.loaded` | Container loaded on vessel |
| `container.discharged` | Container discharged from vessel |
| `container.damaged` | Container damage reported |
| `vessel.departed` | Vessel departed port |
| `vessel.arrived` | Vessel arrived at port |
| `invoice.issued` | Invoice sent to customer |
| `payment.received` | Payment applied |

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "booking.confirmed",
  "timestamp": "2026-03-06T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "booking_number": "BK-202603-00142",
    "customer_id": "uuid",
    "vessel": "CS DOHA",
    "voyage": "V042/2026"
  }
}
```

### Signature Verification

All webhooks include an HMAC-SHA256 signature in the `X-Signature` header:

```
X-Signature: sha256=abc123...
```

Verify by computing `HMAC-SHA256(request_body, webhook_secret)` and comparing.

### Retry Policy

- Failed deliveries (non-2xx response) retry with exponential backoff
- Schedule: 1 min, 5 min, 30 min, 2 hours, 12 hours
- After 5 failures, webhook is marked as failing; admin notified
- Manual retry available in admin panel

---

## External System Integrations

### Customs Authority Systems

| Country | System | Integration Method |
|---------|--------|-------------------|
| Qatar | Hamad Port Authority | API + EDI |
| UAE | Dubai Trade / Mirsal 2 | API |
| KSA | FASAH (Saudi Customs) | API + EDI |
| India | ICEGATE | EDI (EDIFACT) |

### AIS Vessel Tracking

- Real-time vessel position data via AIS providers (MarineTraffic or equivalent)
- Polling interval: 5-15 minutes
- Data: position, speed, heading, draught, destination
- Used by: Schedule & Voyage, Liner Operations, Customer Portal

**API:** `GET /api/v1/vessel/{vesselId}/position`

### Port Community Systems

- Integration with terminal operating systems (TOS)
- Container event feeds (gate, load, discharge)
- Berth and crane allocation data
- Real-time vessel schedule updates

### Banking & Payments

- SWIFT messaging for international payments
- Local payment networks: NAPS (Qatar), UAEFTS (UAE), SARIE (KSA), NEFT/RTGS (India)
- Bank statement import (MT940/CAMT.053)
- Payment gateway integration (Stripe, local bank APIs)

### Email & Communication

SMTP for transactional emails:

- Booking confirmations
- BL issuance notifications
- Customs clearance alerts
- Delivery notifications
- D&D warnings
- Invoice delivery

### Analytics & BI Tools

- Data export API for Tableau, PowerBI, Looker
- Daily batch export of transactional data
- Real-time dashboard data: `GET /api/v1/analytics/dashboard-data`

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_INVALID_TOKEN` | Token expired or invalid |
| `AUTH_MISSING_PERMISSION` | User lacks required permission |
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource state prevents operation |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## Integration Security

- All external connections use TLS 1.2+
- API keys stored encrypted in database
- IP allowlisting available for EDI partners
- All integration traffic logged for audit
- Sensitive fields (credentials) never appear in logs
- Webhook secrets rotatable without downtime

---

## Testing

**Staging Environment:** `https://staging-erp.yourdomain.com/api/v1`

Test all integrations in staging before production. Staging data resets daily at 02:00 UTC.

**Support:** Email your administrator for integration issues.
