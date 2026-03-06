# CS-ERP API Reference

All API routes follow RESTful conventions with Zod input validation, JWT authentication, and cursor-based pagination.

**Base URL:** `https://cs-erp.codilla.ai/api`

---

## Authentication

All `/api/v1/*` routes require a valid JWT access token via the `cs_access_token` cookie. Include `X-CSRF-Token` header on all mutations (POST, PATCH, DELETE).

### Auth Endpoints (Public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user account |
| POST | `/auth/login` | Authenticate and receive tokens |
| POST | `/auth/logout` | Invalidate current session |
| GET | `/auth/me` | Get current authenticated user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset email |
| POST | `/auth/reset-password` | Reset password with token |

### Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | System health status |

---

## Response Format

```json
// Success (single item)
{ "data": { "id": "uuid", ... } }

// Success (list with pagination)
{ "data": [...], "meta": { "total": 100, "cursor": "next-cursor-id" } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "Details", "details": {} } }
```

**Status Codes:** 200, 201, 400, 401, 403, 404, 409, 422, 429, 500

---

## Module API Routes

Each module exposes a consistent CRUD pattern. Collection routes (`/resource`) support GET (list with cursor pagination) and POST (create). Item routes (`/resource/[id]`) support GET, PATCH, and DELETE.

### Accounts Payable & Vendor Management
`/api/v1/accounts-payable-vendor-management`

| Resource | Endpoints |
|----------|-----------|
| `/vendor-masters` | CRUD for vendor records |
| `/vendor-invoices` | CRUD for vendor invoices |
| `/purchase-orders` | CRUD for purchase orders |
| `/three-way-matches` | CRUD for PO/receipt/invoice matching |
| `/payment-schedules` | CRUD for payment scheduling |
| `/ocr-extractions` | CRUD for OCR invoice processing |
| `/spend-analytics` | CRUD for spend analysis |
| `/vendor-reconciliations` | CRUD for vendor account reconciliation |

### Accounts Receivable & Credit Control
`/api/v1/accounts-receivable-credit-control`

| Resource | Endpoints |
|----------|-----------|
| `/customer-accounts` | CRUD for customer AR accounts |
| `/credit-limits` | CRUD for credit limit management |
| `/aging-reports` | CRUD for AR aging analysis |
| `/cash-applications` | CRUD for payment application |
| `/collection-workflows` | CRUD for collection actions |
| `/payment-predictions` | CRUD for AI payment predictions |
| `/cash-flow-forecasts` | CRUD for cash flow projections |
| `/bad-debt-provisions` | CRUD for bad debt management |

### Admin Portal
`/api/v1/admin-portal`

| Resource | Endpoints |
|----------|-----------|
| `/module-configs` | Module configuration |
| `/feature-flags` | Feature flag management |
| `/feature-configs` | Feature configuration |
| `/ai-agent-configs` | AI agent configuration |
| `/approval-matrices` | Approval workflow setup |
| `/integration-endpoints` | External integration config |
| `/notification-configs` | Notification settings |
| `/audit-logs` | System audit trail |
| `/import-export-jobs` | Data import/export |
| `/licenses` | License management |
| `/master-data-configs` | Master data settings |
| `/system-health-metrics` | System health monitoring |

### Admin (Users & Roles)
`/api/v1/admin`

| Resource | Endpoints |
|----------|-----------|
| `/users`, `/users/[userId]` | User management |
| `/roles`, `/roles/[roleId]` | Role management |

### AI Agent Framework
`/api/v1/ai-agent-framework`

| Resource | Endpoints |
|----------|-----------|
| `/agents` | CRUD for AI agent configuration |
| `/runs` | CRUD for agent execution runs |
| `/escalations` | CRUD for agent escalations |
| `/workflow-definitions` | CRUD for workflow templates |
| `/workflow-instances` | CRUD for active workflows |
| `/orchestrate` | POST to orchestrate multi-agent tasks |
| `/documents/process` | POST to trigger document processing |
| `/documents/jobs` | GET document processing jobs |

### Analytics & Business Intelligence
`/api/v1/analytics-business-intelligence`

Resources: `bi-reports`, `customer-revenue-analytics`, `executive-kpi-dashboards`, `market-intelligence-reports`, `operational-efficiencies`, `predictive-forecasts`, `trade-lane-analytics`, `voyage-analytics`

### Audit & Compliance Management
`/api/v1/audit-compliance-management`

Resources: `internal-audits`, `risk-registers`, `policy-procedures`, `sox-financial-controls`, `regulatory-compliance-calendars`, `regulatory-reporting-submissions`, `iso-certification-trackings`, `ai-risk-detections`

### Bunker Fuel Management
`/api/v1/bunker-fuel-management`

Resources: `orders`, `stems`, `quality-tests`, `quality-claims`, `fuel-rob`, `emissions`, `sulphur-records`, `cost-allocations`, `optimization-runs`, `reconciliations`

### Capacity & Voyage Management
`/api/v1/capacity-voyage-management`

Resources: `vessel-schedules`, `port-rotations`, `bay-plans`, `stowage-plans`, `loading-lists`, `load-optimizations`, `space-controls`, `trade-allocations`, `demand-forecasts`, `transshipment-plans`, `schedule-performances`, `revenue-analytics`

### Cargo Claims Management
`/api/v1/cargo-claims-management`

Resources: `claim-registrations`, `damage-surveys`, `liability-assessments`, `claim-settlements`, `subrogation-recoveries`, `time-bar-trackings`, `claim-predictions`, `portfolio-analytics`

### Chartering & Vessel Management
`/api/v1/chartering-vessel-management`

Resources: `charter-parties`, `tc-contracts`, `coa-contracts`, `fixtures`, `hire-statements`, `laytime-calculations`, `off-hire-events`, `delivery-reports`, `voyage-estimates`, `voyage-pnl`, `utilization-analyses`, `vessel-performances`

### Commercial Pricing Management
`/api/v1/commercial-pricing-management`

Resources: `tariffs`, `tariff-rates`, `surcharges`, `special-rates`, `ai-pricing-models`, `yield-targets`, `rate-benchmarks`, `pricing-approvals`, `profitability-analyses`, `revenue-leakages`, `detention-demurrage`, `dead-freight-records`, `vsa-slot-rates`

### Container Leasing Management
`/api/v1/container-leasing-management`

Resources: `lease-agreements`, `onhire-offhires`, `container-redeliveries`, `mnr-damage-billings`, `lease-cost-allocations`, `lessor-reconciliations`, `lease-vs-buy-analyses`, `fleet-optimizers`

### Customer Portal
`/api/v1/customer-portal`

| Resource | Endpoints |
|----------|-----------|
| `/bookings` | List, create, view, confirm, cancel bookings |
| `/bookings/[id]/containers` | Container details for a booking |
| `/tracking` | Shipment tracking |
| `/tracking/[trackingNumber]/events` | Tracking event history |
| `/documents` | Document access |
| `/invoices` | Invoice viewing |
| `/payments` | Payment management |
| `/payments/[id]/transactions` | Payment transactions |

### Customer Service Operations
`/api/v1/customer-service-operations`

Resources: `service-requests`, `inquiries`, `complaints`, `escalations`, `communication-logs`, `agent-assignments`, `sla-policies`, `sla-breaches`, `knowledge-articles`, `customer-feedback`, `resolution-notes`, `service-categories`

### Remaining Modules

All other modules follow the same CRUD pattern with collection and item routes:

- **Costing & Financial** (`costing-financial-management`): cost-centres, voyage-budgets, voyage-pnl, port-disbursements, container-costs, overhead-allocations, agency-commissions, revenue-recognitions, variance-analyses, capex-items, anomaly-detections, kpi-reports
- **Crew Management** (`crew-management`): crew-rotations, certificate-trackings, payroll-allotments, manning-agencies, visa-travel-records, welfare-medical-records, flag-state-compliance, mlc-compliance
- **Customs & Compliance** (`customs-compliance-regulatory`): import-clearances, export-filings, duty-calculations, aeo-compliances, imo-regulations, isps-compliances, psc-preparations, transit-procedures
- **Dangerous Goods** (`dangerous-goods-management`): imdg-compliance, segregation-rules, manifests, booking-screenings, chemical-safety-data, emergency-procedures, incident-reports, placard-requirements
- **Demurrage & Detention** (`demurrage-detention-management`): demurrage-calculations, detention-trackings, free-time-rules, invoices, waivers, disputes, predictions, notifications
- **Document Management** (`document-management-system`): documents, categories, templates, versions, signatures, ocr-results, expiry-alerts, retention-policies, search-index
- **Empty Repositioning** (`empty-container-repositioning-ai`): repositioning-plans, demand-forecasts, inventory-snapshots, route-optimizers, cost-trackings, leasing-decisions, pnl-attributions, return-incentives
- **Equipment & Yard** (`equipment-control-yard-managem`): container-fleet, gate-movements, yard-slots, equipment-interchanges, maintenance-repairs, container-surveys, reefer-containers, leased-containers, on-hire-off-hire, repositioning-plans, repositioning-optimizations, availability-plans
- **Fixed Assets** (`fixed-assets-management`): asset-registries, depreciation-schedules, asset-disposals, impairment-tests, insurance-valuations, lease-accounting, maintenance-schedules, capex-opex-classifications
- **Fleet Deployment** (`fleet-deployment-planning`): deployment-decisions, deployment-optimizers, network-designs, fleet-utilizations, vessel-swaps, fleet-financials, market-intelligence, deployment-contracts
- **Freight Invoice** (`freight-invoice-revenue-management`): invoices, debit-credit-notes, revenue-recognitions, dunning-actions, and more
- **General Ledger** (`general-ledger-financial-reporting`): journal-entries, chart-of-accounts, trial-balances, financial-statements, and more
- **All other modules** follow identical CRUD patterns with 6-12 sub-resources each

---

## Pagination

All list endpoints use cursor-based pagination:

```
GET /api/v1/{module}/{resource}?cursor=<last-id>&limit=50
```

Response includes `meta.cursor` for the next page. Maximum 50 records per request.
