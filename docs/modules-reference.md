# CS-ERP Modules Reference

CS-ERP comprises 61 modules covering all aspects of container shipping operations. Each module includes dedicated database tables, API routes, UI pages, and AI agent integrations.

---

## Sales & Commercial

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Sales & CRM | `sales-crm` | `scm` | Lead management, opportunity tracking, customer accounts, pipeline analytics |
| Commercial Pricing Management | `commercial-pricing-management` | `cpm` | Tariff rates, surcharges, AI pricing models, yield targets, rate benchmarks |
| Liner Revenue Management | `liner-revenue-management` | `lrm` | Revenue optimization, dynamic pricing, demand forecasting |
| Agent Network Management | `agent-network-management` | `anm` | GA agreements, agent commissions, booking authorities, sub-agent configs |
| Customer Service Operations | `customer-service-operations` | `cso` | Service requests, complaints, SLA policies, knowledge articles, escalations |
| Customer Portal | `customer-portal` | `csp` | Self-service bookings, tracking, documents, invoices, payments |

## Booking & Documentation

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Operations & Documentation | `operations-documentation` | `odm` | Shipping instructions, BL management, manifest compilation |
| Freight Invoice & Revenue | `freight-invoice-revenue-management` | `firm` | Invoice generation, debit/credit notes, revenue recognition, dunning |
| Document Management System | `document-management-system` | `dms` | Document storage, OCR, templates, digital signatures, retention policies |

## Vessel & Voyage

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Schedule & Voyage Planning | `schedule-voyage-planning` | `svp` | Port rotations, vessel schedules, ETA management |
| Capacity & Voyage Management | `capacity-voyage-management` | `cap` | Bay plans, stowage plans, load optimization, space controls |
| Chartering & Vessel Management | `chartering-vessel-management` | `cvm` | Charter parties, TC contracts, hire statements, voyage P&L |
| Fleet Deployment Planning | `fleet-deployment-planning` | `fdp` | Deployment optimization, network design, vessel swaps, fleet utilization |
| Vessel Performance & Efficiency | `vessel-performance-efficiency` | `vpe` | Noon reports, speed optimization, CII ratings, hull performance |
| Vessel Technical Management | `vessel-technical-management` | `vtm` | Planned maintenance, dry dock scheduling, class surveys, spare parts |
| Liner Operations Control | `liner-operations-control` | `loc` | Real-time vessel monitoring, port call coordination |
| Liner Trade Route Management | `liner-trade-route-management` | `ltr` | Trade lane setup, service strings, port pairs, transit times |
| Voyage Results & Settlement | `voyage-results-settlement` | `vrs` | Voyage P&L analysis, cost settlement, accruals |

## Container & Equipment

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Equipment Control & Yard | `equipment-control-yard-managem` | `eqy` | Container fleet, gate movements, yard slots, maintenance/repair |
| Container Leasing Management | `container-leasing-management` | `clm` | Lease agreements, on-hire/off-hire, MNR billing, fleet optimization |
| Empty Container Repositioning | `empty-container-repositioning-ai` | (AI-driven) | Repositioning plans, demand forecasts, route optimization |
| Reefer Container Management | `reefer-container-management` | `rcm` | Temperature monitoring, PTI scheduling, power allocation |
| Demurrage & Detention | `demurrage-detention-management` | `ddm` | D&D calculations, free-time rules, waivers, disputes |
| Real-Time IoT Asset Tracking | `real-time-iot-asset-tracking` | `iot` | GPS tracking, sensor data, geofencing, anomaly detection |

## Port & Terminal

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Port Agency Management | `port-agency-management` | `pam` | Port agent assignments, service coordination |
| Port Disbursement Accounting | `port-disbursement-accounting` | `pda` | PDA estimates, FDA reconciliation, cost verification |
| Port Tariff & Terminal Billing | `port-tariff-terminal-billing` | `ptt` | Terminal tariffs, THC calculations, billing verification |
| Transshipment Hub Management | `transshipment-hub-management` | `thm` | Hub operations, relay planning, dwell time optimization |
| Intermodal & ICD Operations | `intermodal-icd-operations` | `icd` | Rail/truck coordination, ICD management, multimodal routing |

## Finance & Accounting

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| General Ledger & Financial Reporting | `general-ledger-financial-reporting` | `glfr` | Chart of accounts, journal entries, financial statements |
| Accounts Payable & Vendor | `accounts-payable-vendor-management` | `apvm` | Vendor masters, purchase orders, three-way match, OCR extraction |
| Accounts Receivable & Credit | `accounts-receivable-credit-control` | `arcc` | Customer accounts, credit limits, aging, cash application |
| Costing & Financial Management | `costing-financial-management` | `cfm` | Cost centres, voyage budgets, variance analysis, revenue recognition |
| Treasury & Cash Management | `treasury-cash-management` | `tcm` | Bank accounts, FX management, cash flow forecasting |
| Fixed Assets Management | `fixed-assets-management` | `fam` | Asset registry, depreciation, lease accounting, impairment |
| Multi-Entity Legal Structure | `multi-entity-legal-structure` | `mels` | Intercompany transactions, consolidation, transfer pricing |

## Bunker & Fuel

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Bunker Fuel Management | `bunker-fuel-management` | `bfm` | Bunker orders, stems, quality tests, emissions, sulphur compliance |

## Compliance & Risk

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Customs & Compliance | `customs-compliance-regulatory` | `ccr` | Import/export filings, duty calculations, AEO, ISPS compliance |
| Dangerous Goods Management | `dangerous-goods-management` | `dgm` | IMDG compliance, segregation rules, DG manifests, emergency procedures |
| MARPOL & Environmental | `marpol-environmental-compliance` | (env) | MARPOL compliance, emissions monitoring, ballast water management |
| Audit & Compliance | `audit-compliance-management` | `acm` | Internal audits, risk registers, SOX controls, ISO certifications |
| Loss Prevention & Risk | `loss-prevention-risk-management` | (risk) | Risk assessment, incident investigation, loss prevention |
| Insurance & Claims | `insurance-claims-management` | `icm` | Policy management, claims handling, P&I coverage |
| Cargo Claims Management | `cargo-claims-management` | `ccm` | Claim registration, damage surveys, liability assessment, settlements |
| Survey & Inspection | `survey-inspection-management` | `sim` | Class surveys, condition inspections, PSC preparation |
| Sustainability & ESG | `sustainability-esg-reporting` | `ser` | Carbon footprint, ESG metrics, sustainability reporting |
| OOG & Special Cargo | `oog-special-cargo-management` | `oog` | Out-of-gauge cargo, breakbulk, project cargo handling |

## HR & Procurement

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| HR & Payroll (Shore Staff) | `hr-payroll-shore-staff` | `hps` | Employee management, payroll, leave, recruitment |
| Crew Management | `crew-management` | `crm` | Crew rotations, certifications, MLC compliance, payroll allotments |
| Procurement & Supply Chain | `procurement-supply-chain` | `psc` | Purchase requisitions, vendor selection, contract management |

## AI & Analytics

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| AI Agent Framework | `ai-agent-framework` | `aaf` | 100 AI agents, workflow orchestration, document processing |
| Analytics & Business Intelligence | `analytics-business-intelligence` | `abi` | BI reports, KPI dashboards, predictive forecasts, trade lane analytics |

## Platform & Infrastructure

| Module | Slug | DB Prefix | Key Features |
|--------|------|-----------|-------------|
| Admin Portal | `admin-portal` | `admin` | System config, feature flags, module configs, integration endpoints |
| Master Data Management | `master-data-management` | `mdm` | Ports, vessels, currencies, UN/LOCODE, container types |
| Workflow & Notification Engine | `workflow-notification-engine` | `wne` | Approval workflows, email/SMS/push notifications, escalation rules |
| Integration & EDI Layer | `integration-edi-layer` | `iel` | EDI messages (BAPLIE, COPARN), API integrations, message queues |
| Infrastructure & Security | `infrastructure-security` | `isf` | SSL, backup, monitoring, security policies |
| Implementation & Change | `implementation-change-management` | (impl) | Go-live planning, change requests, training tracking |
| Knowledge Management & Training | `knowledge-management-training` | `kmt` | Training modules, SOPs, knowledge base |
| Mobile Operations App | `mobile-operations-app` | `mob` | Mobile-optimized operations for field staff |
| Onboarding | `onboarding` | - | Tenant setup wizard, initial configuration |

---

## Module File Structure

Each module follows a consistent layout:

```
src/app/(dashboard)/{module-slug}/       # UI pages
src/app/api/v1/{module-slug}/            # API routes
src/db/schema/{module-slug}.ts           # Database schema
src/types/{module-slug}.ts               # TypeScript types
src/lib/{module-slug}/                   # Utility functions
```

## Permissions

Permissions follow the format `{module}:{action}`:
- `{module}:read` -- View records
- `{module}:create` -- Create new records
- `{module}:update` -- Modify existing records
- `{module}:delete` -- Soft-delete records
- `{module}:approve` -- Approve workflows
- `{module}:manage` -- Full administrative access
