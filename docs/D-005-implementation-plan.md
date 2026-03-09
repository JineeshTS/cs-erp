# D-005: AI-First Process Orchestration — Implementation Plan

> Decision: D-005 | Status: Draft | Created: 2026-03-09
> Source of truth: `knowledge-graph/decisions/D-005.json`

---

## 1. WHY THIS EXISTS

The ERP was built human-first. Humans navigate modules, click buttons, enter data. AI agents are helpers called on request. 227 processes and 20 E2E flows exist as documentation on a page — nothing executes, nothing is connected to real transactions, nothing is tracked.

An AI-first ERP means the AI operates the business 24/7. Humans supervise, approve, and handle exceptions. Every transaction (booking, container, vessel, invoice) IS a live process flowing through the system.

### What's Wrong Today

| Metric | Current | Problem |
|--------|---------|---------|
| Processes | 227 | 81 (35.7%) are ORPHANED — not in any E2E flow |
| E2E Flows | 20 | Only ~8 steps each — real operations need 15-30 |
| Flow-to-Process linkage | None | Flows reference module names, not PRC-xxx IDs |
| Transaction binding | None | A booking in the DB has no connection to any flow |
| Event triggers | None | Everything waits for a human to click "Run" |
| Missing business areas | 24 | Feeder ops, alliance, trade finance, tax, L/C, etc. |

---

## 2. THE TARGET

| Metric | Target |
|--------|--------|
| Processes | **290** (227 existing + 63 new) — zero orphans |
| E2E Flows | **35** (20 redesigned + 15 new) — 18-25 steps each |
| Every step | References PRC-xxx, defines AI vs human executor |
| Transaction binding | 27 entity-event-flow mappings |
| Human gates | 4 gate types with SLA, escalation, AI recommendation |
| AI execution | 70%+ of steps run autonomously |

---

## 3. COMPLETE LIST OF 63 NEW PROCESSES

### 3.1 Cargo Routing & Itinerary (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-228 | Cargo Route Calculation | Determine optimal route A→B: direct, hub-spoke, multi-TS. Consider transit time, cost, reliability | Routing Engine Agent | full_auto |
| PRC-229 | Transit Time Optimization | Calculate and compare transit time options across available services | Routing Engine Agent | full_auto |
| PRC-230 | Multi-Leg Itinerary Planning | Build complete itinerary for cargo requiring multiple vessel legs, feeders, inland transport | Routing Engine Agent | semi_auto |

### 3.2 Feeder Vessel Operations (11 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-231 | Feeder Service Design | Plan hub-spoke routes, port coverage, frequency, vessel size for feeder network | Network Planning Agent | ai_assisted |
| PRC-232 | Feeder Schedule Synchronization | Align feeder ETA/ETD with mainline vessel calls at hub port | Feeder Coordination Agent | full_auto |
| PRC-233 | Feeder Connection Risk Monitoring | Real-time monitoring: will feeder arrive before mainline departs? Flag at-risk connections | Feeder Coordination Agent | full_auto |
| PRC-234 | Feeder Delay Impact Assessment | If feeder delayed — which mainline connections at risk, which containers must roll | Feeder Coordination Agent | full_auto |
| PRC-235 | Feeder-Mainline Cargo Handover | Physical and data handover at hub port between feeder and mainline | Feeder Operations Agent | semi_auto |
| PRC-236 | Feeder BL Management | Handle feeder BL vs through BL split, BL switching at hub | Feeder Operations Agent | semi_auto |
| PRC-237 | Feeder Cargo Cutoff Management | Set feeder-specific cutoffs that allow hub transfer before mainline cutoff | Feeder Coordination Agent | full_auto |
| PRC-238 | Feeder Fleet Deployment | Assign feeder vessels to spoke routes, optimize frequency and capacity | Network Planning Agent | ai_assisted |
| PRC-239 | Feeder Performance Monitoring | Connection success rate, schedule reliability, utilization per spoke route | Feeder Analytics Agent | full_auto |
| PRC-240 | Feeder Cost Allocation | Allocate feeder leg costs to mainline voyages and bookings | Cost Allocation Agent | full_auto |
| PRC-241 | Feeder Voyage P&L | Calculate feeder rotation P&L: revenue per leg, costs, contribution margin | Voyage P&L Agent | full_auto |

### 3.3 Alliance & Vessel Sharing (5 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-242 | VSA Agreement Management | Manage vessel sharing agreement terms, slot allocations, partner obligations | Alliance Management Agent | semi_auto |
| PRC-243 | Slot Purchase & Sale | Buy/sell vessel slots per voyage from/to alliance partners | Alliance Management Agent | semi_auto |
| PRC-244 | Alliance Schedule Coordination | Coordinate service strings, port rotations, and ETAs with alliance partners | Alliance Management Agent | semi_auto |
| PRC-245 | Revenue Sharing Calculation | Calculate revenue/cost share per voyage per partner per agreed formula | Alliance Finance Agent | full_auto |
| PRC-246 | Equipment Interchange | Manage container interchange with partner lines: SOC/COC agreements, tracking | Equipment Agent | semi_auto |

### 3.4 Inland Transport & Door Delivery (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-247 | Inland Transport Mode Selection | Decide truck vs rail vs barge for inland leg based on cost, time, availability | Inland Transport Agent | full_auto |
| PRC-248 | Truck Dispatch & Booking | Book trucking for container pickup/delivery, assign driver, route | Inland Transport Agent | semi_auto |
| PRC-249 | Rail Booking & Coordination | Book rail transport, coordinate terminal-to-terminal, track movement | Inland Transport Agent | semi_auto |
| PRC-250 | Proof of Delivery Management | Capture and validate POD (electronic or paper), close delivery loop | Inland Transport Agent | full_auto |

### 3.5 Letter of Credit & Trade Finance (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-251 | L/C Receipt & Checking | Receive L/C from bank, validate terms against booking/contract, flag discrepancies | Trade Finance Agent | semi_auto |
| PRC-252 | Document Presentation to Bank | Prepare compliant document set (BL, invoice, packing list, CO) for bank presentation | Trade Finance Agent | semi_auto |
| PRC-253 | L/C Discrepancy Handling | Manage discrepancies between L/C terms and documents, negotiate amendments | Trade Finance Agent | ai_assisted |
| PRC-254 | Trade Finance Tracking | Track L/C status, amendment requests, payment timelines, expiry dates | Trade Finance Agent | full_auto |

### 3.6 Tax / VAT / GST (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-255 | Tax Calculation per Jurisdiction | Calculate VAT/GST per invoice based on jurisdiction (UAE 5%, KSA 15%, India 18%) | Tax Compliance Agent | full_auto |
| PRC-256 | VAT/GST Filing | Prepare and submit periodic VAT/GST returns per country | Tax Compliance Agent | semi_auto |
| PRC-257 | Withholding Tax Management | Calculate and apply WHT on payments to foreign vendors per treaty rates | Tax Compliance Agent | full_auto |
| PRC-258 | Tax Audit Preparation | Compile documentation for tax authority audits, reconcile submissions | Tax Compliance Agent | ai_assisted |

### 3.7 Multi-Currency Operations (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-259 | Multi-Currency Invoice Generation | Generate invoices in customer's currency with FX rate at invoice date | Financial Agent | full_auto |
| PRC-260 | FX Gain/Loss Calculation | Calculate realized/unrealized FX gains and losses on settlements | Financial Agent | full_auto |
| PRC-261 | FX Hedging Execution | Execute forward contracts or hedging instruments per treasury policy | Treasury Agent | ai_assisted |

### 3.8 Document Release & BL Management (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-262 | BL Release Type Determination | Determine release method: original, telex release, seaway bill, express release based on customer/trade terms | Documentation Agent | full_auto |
| PRC-263 | Telex Release Processing | Process telex release request, verify payment/credit, issue release notification to destination | Documentation Agent | semi_auto |
| PRC-264 | Switch BL Processing | Process BL switch at intermediate port (change shipper/consignee for trading transactions) | Documentation Agent | ai_assisted |
| PRC-265 | Original BL Courier Tracking | Track physical BL original dispatch, courier status, delivery confirmation | Documentation Agent | full_auto |

### 3.9 Roll-Over Management (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-266 | Roll-Over Decision | Determine if cargo must roll (vessel full, late arrival, equipment issue) and recommend next sailing | Operations Agent | full_auto |
| PRC-267 | Roll-Over Rebooking | Rebook rolled cargo on next available vessel, update space allocation and equipment | Operations Agent | full_auto |
| PRC-268 | Roll-Over Customer Notification | Notify customer of roll with new ETA, reason, and compensation if applicable | Operations Agent | full_auto |
| PRC-269 | Roll-Over Impact Assessment | Assess downstream impact: connecting cargo, feeder connections, customer SLAs at risk | Operations Agent | full_auto |

### 3.10 Booking Cut-Off Management (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-270 | Cut-Off Schedule Setting | Set documentation, VGM, cargo receiving, and DG cut-offs per port per vessel | Operations Agent | semi_auto |
| PRC-271 | Cut-Off Enforcement & Alert | Monitor approaching cut-offs, alert customers and ops, enforce gate-in restrictions | Operations Agent | full_auto |
| PRC-272 | Late Arrival Exception Handling | Handle cargo arriving after cut-off: exception approval, penalty, or roll to next vessel | Operations Agent | ai_assisted |

### 3.11 Customs Hold & Examination (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-273 | Customs Hold Response | Respond to customs hold: identify reason, prepare documentation, coordinate examination | Customs Agent | semi_auto |
| PRC-274 | Duty Calculation & Payment | Calculate customs duty based on HS code, origin, trade agreements; process payment | Customs Agent | full_auto |
| PRC-275 | Customs Examination Coordination | Coordinate physical examination: schedule, attend, document results, obtain release | Customs Agent | ai_assisted |

### 3.12 Container Depot Management (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-276 | Depot Gate Management | Manage gate hours, check-in/check-out, truck appointments at container depots | Depot Operations Agent | full_auto |
| PRC-277 | Depot Inventory Control | Track empty stock levels by type/grade at each depot, trigger alerts on shortages | Depot Operations Agent | full_auto |
| PRC-278 | Depot M&R Vendor Coordination | Manage maintenance & repair vendors: work orders, cost approval, quality checks | Depot Operations Agent | semi_auto |
| PRC-279 | Depot Storage Charge Calculation | Calculate storage charges for containers held beyond free time at depot | Depot Operations Agent | full_auto |

### 3.13 Customer Rebates & Volume Incentives (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-280 | Volume Commitment Tracking | Track actual volumes vs contractual commitments per customer per trade lane | Commercial Intelligence Agent | full_auto |
| PRC-281 | Rebate Calculation | Calculate earned rebates based on volume tiers, performance thresholds | Commercial Intelligence Agent | full_auto |
| PRC-282 | Rebate Settlement | Generate rebate credit notes, approve settlements, process payments | Commercial Intelligence Agent | semi_auto |

### 3.14 Liner Agency (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-283 | Liner Agency Appointment | Manage appointment as agent for principal line: agreement terms, scope, territory | Agency Management Agent | ai_assisted |
| PRC-284 | Liner Agency Operations | Handle cargo operations, documentation, customer service on behalf of principal line | Agency Management Agent | semi_auto |
| PRC-285 | Liner Agency Commission Settlement | Calculate commission earned, reconcile with principal, process settlement | Agency Management Agent | full_auto |

### 3.15 NVOCC & LCL Operations (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-286 | House BL Generation | Generate house BL on top of master BL for NVOCC/freight forwarder operations | NVOCC Agent | full_auto |
| PRC-287 | LCL Consolidation Planning | Plan LCL consolidation: which shipments into which container, optimize fill rate | NVOCC Agent | full_auto |
| PRC-288 | CFS Stuffing/Destuffing | Coordinate container freight station operations for LCL cargo | NVOCC Agent | semi_auto |
| PRC-289 | House-to-Master BL Reconciliation | Reconcile house BL quantities/weights against master BL for customs and accounting | NVOCC Agent | full_auto |

### 3.16 Port Congestion & Exception Management (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-290 | Port Congestion Assessment | Monitor port congestion levels, anchorage waiting times, terminal delays | Port Intelligence Agent | full_auto |
| PRC-291 | Alternative Routing Decision | When congestion impacts schedule — evaluate diversion, port omission, or wait | Port Intelligence Agent | ai_assisted |
| PRC-292 | Disruption Impact Communication | Communicate operational disruptions to all affected parties: customers, agents, partners | Port Intelligence Agent | full_auto |

### 3.17 Insurance Policy Management (4 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-293 | Insurance Policy Renewal | Manage policy renewal cycle for P&I, H&M, cargo, FD&D insurance | Insurance Agent | semi_auto |
| PRC-294 | Premium Calculation | Calculate insurance premium based on fleet value, loss record, coverage scope | Insurance Agent | full_auto |
| PRC-295 | Coverage Gap Assessment | Identify gaps in insurance coverage vs operational risk profile | Insurance Agent | full_auto |
| PRC-296 | H&M Survey Coordination | Coordinate Hull & Machinery condition surveys with class society and underwriters | Insurance Agent | semi_auto |

### 3.18 Voyage Bunker Management (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-297 | Bunker ROB Tracking | Track Remaining on Board fuel quantities per vessel per fuel type | Bunker Management Agent | full_auto |
| PRC-298 | Consumption vs Plan Analysis | Compare actual fuel consumption per leg against voyage plan, flag variances | Bunker Management Agent | full_auto |
| PRC-299 | Charter Bunker Clause Settlement | Calculate bunker adjustment under charter party terms at delivery/redelivery | Bunker Management Agent | semi_auto |

### 3.19 Off-Hire & Performance Claims (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-300 | Off-Hire Period Calculation | Calculate off-hire time for breakdowns, dry dock, deviation from charter route | Charter Agent | full_auto |
| PRC-301 | Speed & Consumption Claim | Assess vessel performance against CP warranty, calculate speed/consumption claims | Charter Agent | semi_auto |
| PRC-302 | Weather Routing Dispute Resolution | Resolve disputes over weather routing and its impact on performance claims | Charter Agent | ai_assisted |

### 3.20 Fleet Strategy & Ship S&P (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-303 | Fleet Renewal Planning | Analyze fleet age, capacity needs, market outlook to plan fleet renewal cycle | Fleet Strategy Agent | ai_assisted |
| PRC-304 | Ship S&P Evaluation | Evaluate vessel sale/purchase opportunities against fleet plan and market values | Fleet Strategy Agent | ai_assisted |
| PRC-305 | Newbuilding Specification | Develop vessel specifications for newbuilding orders based on trade requirements | Fleet Strategy Agent | ai_assisted |

### 3.21 Break-Bulk & Project Cargo (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-306 | Break-Bulk Booking Assessment | Assess non-containerized cargo: dimensions, weight, lifting requirements, vessel suitability | Special Cargo Agent | ai_assisted |
| PRC-307 | Project Cargo Planning | End-to-end logistics planning for project cargo: transport chain, permits, insurance, timing | Special Cargo Agent | ai_assisted |
| PRC-308 | Lashing & Securing Plan | Generate cargo securing plan per IMO CSS Code, arrange marine warranty surveyor if needed | Special Cargo Agent | semi_auto |

### 3.22 Sanctions & Embargo Operations (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-309 | Ongoing Sanctions Monitoring | Continuously monitor existing customers and counterparties against updated sanctions lists | Compliance Screening Agent | full_auto |
| PRC-310 | Sanctioned Party Response | When existing customer/counterparty is sanctioned: freeze operations, report, seek legal guidance | Compliance Screening Agent | ai_assisted |
| PRC-311 | Dual-Use Goods License Management | Track export licenses for dual-use goods, ensure valid licenses before shipment | Compliance Screening Agent | semi_auto |

### 3.23 Credit Insurance (2 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-312 | Credit Insurance Application | Apply for trade credit insurance coverage for high-value customer accounts | Credit Risk Agent | semi_auto |
| PRC-313 | Credit Insurance Claim | File claim with credit insurer when covered customer defaults on payment | Credit Risk Agent | semi_auto |

### 3.24 Emergency & Salvage (3 processes)

| ID | Name | Description | Agent | Automation |
|----|------|-------------|-------|------------|
| PRC-314 | Emergency Response Activation | Activate emergency response protocol for critical incidents (grounding, collision, fire, piracy) | Emergency Response Agent | semi_auto |
| PRC-315 | General Average Declaration | Declare General Average, appoint average adjusters, notify cargo interests and insurers | Emergency Response Agent | ai_assisted |
| PRC-316 | Salvage Coordination | Coordinate salvage operations: salvors, authorities, environmental response, cost tracking | Emergency Response Agent | ai_assisted |

---

## 4. COMPLETE LIST OF 35 E2E FLOWS

### 4.1 Revenue Cycle (4 flows)

#### E2E-01: Booking-to-Cash (REDESIGNED — 8→25 steps)

The backbone commercial flow. Triggered when a booking is confirmed.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-228 | Cargo route calculation | AI | |
| 2 | PRC-010 | Customer credit check | AI | |
| 3 | — | Credit gate: approve if over limit | Human | APPROVAL |
| 4 | PRC-004 | Quote generation (if not already quoted) | AI | |
| 5 | PRC-021 | Booking creation & confirmation | AI | |
| 6 | PRC-024 | Space allocation on vessel | AI | |
| 7 | PRC-025 | Equipment reservation from depot | AI | |
| 8 | PRC-248 | Truck dispatch for empty pickup (if door terms) | AI | |
| 9 | PRC-270 | Cut-off schedule setting | System | |
| 10 | PRC-029 | VGM processing | System | |
| 11 | PRC-271 | Cut-off enforcement check | AI | |
| 12 | PRC-064 | Container gate-in at terminal | System | |
| 13 | PRC-033 | DG classification (if DG cargo) | AI | |
| 14 | PRC-043 | Stowage planning | AI | |
| 15 | PRC-161 | Customs export declaration | AI | |
| 16 | — | Customs gate: hold response if examined | Human | EXCEPTION |
| 17 | PRC-038 | Shipping instruction processing | AI | |
| 18 | PRC-026 | Bill of Lading generation | AI | |
| 19 | PRC-262 | BL release type determination | AI | |
| 20 | — | BL review gate | Human | APPROVAL |
| 21 | PRC-028 | Manifest compilation | AI | |
| 22 | PRC-121 | Freight invoice generation | AI | |
| 23 | PRC-255 | Tax calculation per jurisdiction | AI | |
| 24 | PRC-126 | Cash application (on payment received) | AI | |
| 25 | PRC-132 | Revenue recognition | AI | |

**Human gates:** Credit approval (step 3), Customs hold (step 16), BL review (step 20)
**Conditional branches:** If DG cargo → also triggers E2E-06. If reefer → also triggers E2E-05. If L/C terms → also triggers E2E-26.
**Child flows:** Creates E2E-04 per container (export). Creates E2E-03 per container at destination (import).

#### E2E-16: Customer Lifecycle (REDESIGNED — 8→20 steps)

Full customer relationship from lead to retention. Triggered on lead creation.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-001 | Lead capture & enrichment | AI | |
| 2 | PRC-002 | Lead scoring | AI | |
| 3 | PRC-003 | Opportunity qualification | AI | |
| 4 | — | Sales gate: accept/reject opportunity | Human | DECISION |
| 5 | PRC-004 | Quote generation | AI | |
| 6 | PRC-005 | Rate negotiation support | AI | |
| 7 | — | Rate gate: approve negotiated rate | Human | APPROVAL |
| 8 | PRC-006 | Contract creation | AI | |
| 9 | — | Contract gate: legal review if non-standard | Human | APPROVAL |
| 10 | PRC-008 | Customer onboarding | AI | |
| 11 | PRC-009 | KYC verification | AI | |
| 12 | PRC-010 | Credit scoring | AI | |
| 13 | — | Credit gate: approve credit limit | Human | APPROVAL |
| 14 | PRC-015 | SLA monitoring (continuous) | AI | |
| 15 | PRC-012 | Customer segmentation (scheduled) | AI | |
| 16 | PRC-017 | Account health scoring (scheduled) | AI | |
| 17 | PRC-013 | Churn prediction | AI | |
| 18 | — | Retention gate: review at-risk accounts | Human | DECISION |
| 19 | PRC-007 | Contract renewal (at expiry) | AI | |
| 20 | PRC-280 | Volume commitment tracking | AI | |

#### E2E-18: Trade Route Launch (REDESIGNED — 9→20 steps)

New service/trade lane launch. Triggered on proposal approval.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-101 | Trade lane demand analysis | AI | |
| 2 | PRC-110 | Demand forecasting | AI | |
| 3 | PRC-118 | Competitive rate monitoring | AI | |
| 4 | — | Business case gate: approve/reject launch | Human | DECISION |
| 5 | PRC-242 | VSA/slot agreement (if alliance) | AI | |
| 6 | PRC-057 | Fleet deployment planning | AI | |
| 7 | PRC-231 | Feeder service design (if hub-spoke) | AI | |
| 8 | PRC-041 | Voyage planning | AI | |
| 9 | PRC-042 | Schedule optimization | AI | |
| 10 | — | Schedule gate: approve rotation | Human | APPROVAL |
| 11 | PRC-019 | Pricing optimization | AI | |
| 12 | PRC-020 | Surcharge calculation | AI | |
| 13 | PRC-106 | Agent appointment at new ports | AI | |
| 14 | — | Agent gate: approve agency agreements | Human | APPROVAL |
| 15 | PRC-014 | Marketing campaign launch | AI | |
| 16 | PRC-105 | Trade lane P&L tracking | AI | |
| 17 | PRC-117 | Market share analysis | AI | |
| 18 | PRC-115 | Capacity planning (ongoing) | AI | |
| 19 | PRC-116 | Seasonal rate adjustment | AI | |
| 20 | PRC-114 | Yield optimization | AI | |

#### E2E-27: Revenue Management & Yield Optimization (NEW — 15 steps)

Continuous revenue optimization. Triggered weekly or on capacity threshold.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-044 | Capacity forecasting | AI | |
| 2 | PRC-110 | Demand forecasting | AI | |
| 3 | PRC-118 | Competitive rate monitoring | AI | |
| 4 | PRC-111 | Freight rate benchmarking | AI | |
| 5 | PRC-019 | Pricing optimization | AI | |
| 6 | PRC-114 | Yield optimization | AI | |
| 7 | — | Pricing gate: approve rate changes | Human | APPROVAL |
| 8 | PRC-020 | Surcharge calculation | AI | |
| 9 | PRC-116 | Seasonal rate adjustment | AI | |
| 10 | — | Seasonal gate: approve seasonal rates | Human | APPROVAL |
| 11 | PRC-113 | Revenue integrity check | AI | |
| 12 | PRC-280 | Volume commitment tracking | AI | |
| 13 | PRC-281 | Rebate calculation | AI | |
| 14 | PRC-282 | Rebate settlement | AI | |
| 15 | — | Rebate gate: approve settlements | Human | APPROVAL |

### 4.2 Vessel Operations (7 flows)

#### E2E-02: Vessel Voyage Lifecycle (REDESIGNED — 8→25 steps)

Full voyage from planning to settlement. Triggered on voyage creation.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-041 | Voyage planning (rotation, speed, weather) | AI | |
| 2 | PRC-042 | Schedule optimization | AI | |
| 3 | PRC-043 | Stowage planning | AI | |
| 4 | PRC-044 | Capacity forecasting | AI | |
| 5 | PRC-047 | Bunker procurement initiation | AI | |
| 6 | — | Bunker gate: approve bunker order | Human | APPROVAL |
| 7 | PRC-084 | Cargo operations at each port (loading) | System | |
| 8 | PRC-081 | Pre-arrival notification at each port | System | |
| 9 | PRC-051 | Noon report analysis (daily at sea) | AI | |
| 10 | PRC-052 | Weather routing adjustment | AI | |
| 11 | PRC-053 | Speed optimization | AI | |
| 12 | PRC-054 | ETA prediction update | AI | |
| 13 | PRC-049 | Emissions calculation per leg | AI | |
| 14 | PRC-297 | Bunker ROB tracking | AI | |
| 15 | PRC-298 | Consumption vs plan analysis | AI | |
| 16 | PRC-165 | PSC preparation (at port) | AI | |
| 17 | PRC-084 | Cargo operations at each port (discharge) | System | |
| 18 | PRC-087 | Port disbursement at each port | AI | |
| 19 | PRC-055 | Port turnaround optimization | AI | |
| 20 | PRC-056 | Vessel performance analysis | AI | |
| 21 | PRC-050 | CII rating update | AI | |
| 22 | PRC-059 | Voyage P&L calculation | AI | |
| 23 | PRC-060 | Voyage settlement | AI | |
| 24 | — | Settlement gate: approve voyage P&L | Human | APPROVAL |
| 25 | PRC-048 | Fuel consumption final analysis | AI | |

#### E2E-08: Charter Party Lifecycle (REDESIGNED — 8→18 steps)

Full charter cycle. Triggered on charter requirement identification.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-045 | Charter market analysis | AI | |
| 2 | — | Charter gate: approve charter strategy | Human | DECISION |
| 3 | PRC-045 | Charter negotiation support | AI | |
| 4 | — | Fixture gate: approve fixture terms | Human | APPROVAL |
| 5 | PRC-046 | Fixture confirmation & CP execution | System | |
| 6 | — | On-hire survey | Human | INPUT |
| 7 | PRC-297 | Bunker ROB at delivery | AI | |
| 8 | PRC-056 | Vessel performance monitoring vs CP warranty | AI | |
| 9 | PRC-300 | Off-hire period calculation (ongoing) | AI | |
| 10 | — | Off-hire gate: approve off-hire deduction | Human | APPROVAL |
| 11 | PRC-301 | Speed & consumption claim assessment | AI | |
| 12 | PRC-302 | Weather routing dispute resolution | AI | |
| 13 | — | Claims gate: approve performance claims | Human | DECISION |
| 14 | — | Redelivery survey | Human | INPUT |
| 15 | PRC-297 | Bunker ROB at redelivery | AI | |
| 16 | PRC-299 | Charter bunker clause settlement | AI | |
| 17 | PRC-060 | Final charter hire settlement | AI | |
| 18 | — | Final settlement gate: approve | Human | APPROVAL |

#### E2E-12: Port Call Management (REDESIGNED — 8→20 steps)

Per-port-call operations. Triggered 24h before vessel ETA.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-290 | Port congestion check | AI | |
| 2 | PRC-081 | Pre-arrival notification (crew list, manifest, DG) | AI | |
| 3 | PRC-083 | Berth allocation request | AI | |
| 4 | PRC-165 | PSC preparation checklist | AI | |
| 5 | PRC-166 | ISPS security notification | System | |
| 6 | PRC-082 | Vessel clearance (immigration, customs, health) | System | |
| 7 | — | Clearance gate: resolve any holds | Human | EXCEPTION |
| 8 | PRC-085 | Husbandry coordination (pilot, tow, mooring) | AI | |
| 9 | PRC-084 | Cargo discharge operations | System | |
| 10 | PRC-084 | Cargo loading operations | System | |
| 11 | PRC-085 | Port services (water, provisions, waste, crew) | Human | INPUT |
| 12 | PRC-086 | Cash to master processing | Human | INPUT |
| 13 | PRC-088 | PDA estimation | AI | |
| 14 | PRC-082 | Departure clearance | System | |
| 15 | PRC-089 | PDA reconciliation (proforma vs actual) | AI | |
| 16 | — | PDA gate: approve if variance > 10% | Human | APPROVAL |
| 17 | PRC-087 | Disbursement payment | System | |
| 18 | PRC-055 | Port turnaround analysis | AI | |
| 19 | PRC-096 | Port tariff verification | AI | |
| 20 | PRC-097 | Terminal handling charge reconciliation | AI | |

#### E2E-17: Vessel Dry Dock (REDESIGNED — 9→18 steps)

Triggered when dry dock is planned.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-167 | Class survey scheduling | AI | |
| 2 | — | Dry dock scope gate: approve work list | Human | APPROVAL |
| 3 | PRC-153 | Shipyard tendering | AI | |
| 4 | — | Shipyard gate: select yard | Human | DECISION |
| 5 | PRC-152 | Purchase orders for yard works | AI | |
| 6 | PRC-042 | Schedule vessel off-hire window | AI | |
| 7 | — | Schedule gate: minimize commercial impact | Human | APPROVAL |
| 8 | PRC-293 | Insurance notification | System | |
| 9 | — | Dry dock execution | Human | INPUT |
| 10 | — | Additional works gate: approve scope creep | Human | APPROVAL |
| 11 | PRC-167 | Class survey & flag state inspection | System | |
| 12 | PRC-296 | H&M survey coordination | Human | INPUT |
| 13 | — | Certificate gate: verify all renewed | Human | APPROVAL |
| 14 | — | Sea trial verification | Human | INPUT |
| 15 | PRC-134 | Dry dock cost variance analysis | AI | |
| 16 | — | Budget gate: approve final cost | Human | APPROVAL |
| 17 | PRC-129 | Shipyard invoice processing | AI | |
| 18 | PRC-130 | Three-way match | AI | |

#### E2E-21: Feeder Voyage Lifecycle (NEW — 20 steps)

Complete feeder rotation. Triggered on feeder schedule publication.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-232 | Sync feeder schedule with mainline | AI | |
| 2 | PRC-237 | Set feeder-specific cut-offs | AI | |
| 3 | PRC-238 | Feeder fleet deployment | AI | |
| 4 | PRC-043 | Feeder stowage planning | AI | |
| 5 | PRC-235 | Load transshipment cargo from mainline at hub | System | |
| 6 | — | Load gate: verify all TS cargo loaded | Human | APPROVAL |
| 7 | — | Hub departure | System | |
| 8 | PRC-054 | ETA prediction for spoke ports | AI | |
| 9 | PRC-084 | Discharge at spoke port 1 | System | |
| 10 | PRC-084 | Load at spoke port 1 | System | |
| 11 | PRC-084 | Discharge at spoke port 2 | System | |
| 12 | PRC-084 | Load at spoke port 2 | System | |
| 13 | PRC-233 | Connection risk check (will we make mainline?) | AI | |
| 14 | — | Connection gate: if at risk, decide speed up or roll cargo | Human | DECISION |
| 15 | — | Hub arrival | System | |
| 16 | PRC-235 | Discharge cargo for mainline connection | System | |
| 17 | — | Connection gate: verify all cargo transferred | Human | APPROVAL |
| 18 | PRC-236 | Feeder BL completion | AI | |
| 19 | PRC-241 | Feeder voyage P&L | AI | |
| 20 | PRC-240 | Feeder cost allocation to mainline voyages | AI | |

#### E2E-22: Feeder-Mainline Connection Management (NEW — 15 steps)

Managing cargo transfer at hub. Triggered when mainline arrives with TS cargo.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-099 | Identify all outbound feeder connections | AI | |
| 2 | PRC-232 | Check feeder schedule alignment | AI | |
| 3 | PRC-233 | Monitor connection windows | AI | |
| 4 | PRC-234 | Flag at-risk connections (< 12h buffer) | AI | |
| 5 | — | Connection gate: prioritize containers if tight | Human | DECISION |
| 6 | PRC-063 | Yard slot optimization for TS cargo | AI | |
| 7 | PRC-100 | Track container movements hub yard | AI | |
| 8 | PRC-043 | Feeder load plan | AI | |
| 9 | PRC-235 | Physical cargo transfer to feeder | System | |
| 10 | — | Load gate: verify all TS containers on feeder | Human | APPROVAL |
| 11 | PRC-030 | Update tracking milestones | AI | |
| 12 | PRC-236 | Update through BL with feeder details | AI | |
| 13 | PRC-054 | Revised ETA at final destination | AI | |
| 14 | PRC-292 | Customer notification with updated ETA | AI | |
| 15 | PRC-240 | Cost allocation for TS handling | AI | |

#### E2E-28: Maritime Safety & Compliance (NEW — 18 steps)

Triggered on inspection due date, incident report, or certificate expiry.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-165 | PSC preparation checklist | AI | |
| 2 | PRC-166 | ISPS security compliance check | AI | |
| 3 | PRC-167 | Class survey requirement check | AI | |
| 4 | — | Inspection gate: review prep status | Human | APPROVAL |
| 5 | — | Inspection/survey execution | Human | INPUT |
| 6 | PRC-174 | Risk register update from findings | AI | |
| 7 | — | Findings gate: approve corrective actions | Human | APPROVAL |
| 8 | PRC-173 | Audit planning for corrective actions | AI | |
| 9 | PRC-176 | MARPOL compliance review | AI | |
| 10 | PRC-177 | Ballast water management check | AI | |
| 11 | PRC-168 | Draft survey recording | System | |
| 12 | PRC-175 | SOX control testing (if applicable) | AI | |
| 13 | PRC-179 | Incident investigation (if triggered by incident) | AI | |
| 14 | — | Investigation gate: approve RCA and actions | Human | APPROVAL |
| 15 | PRC-145 | MLC compliance check | AI | |
| 16 | PRC-142 | Certificate tracking & renewal | AI | |
| 17 | — | Certificate gate: verify all valid | Human | APPROVAL |
| 18 | PRC-180 | Regulatory reporting submission | AI | |

### 4.3 Container Operations (8 flows)

#### E2E-03: Import Container Flow (REDESIGNED — 8→22 steps)

Triggered when vessel arrives at destination with import cargo.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-084 | Vessel discharge — container offloaded | System | |
| 2 | PRC-030 | Tracking update — container at port | AI | |
| 3 | PRC-161 | Import customs declaration filing | AI | |
| 4 | PRC-274 | Duty calculation | AI | |
| 5 | — | Customs gate: pay duty or dispute | Human | DECISION |
| 6 | PRC-273 | Customs hold response (if examined) | AI | |
| 7 | PRC-275 | Customs examination coordination | Human | INPUT |
| 8 | — | Customs release | System | |
| 9 | PRC-039 | Cargo release order | AI | |
| 10 | PRC-040 | Delivery order generation | AI | |
| 11 | PRC-247 | Inland transport mode selection | AI | |
| 12 | PRC-248 | Truck dispatch for delivery | AI | |
| 13 | PRC-094 | Last-mile delivery tracking | AI | |
| 14 | PRC-250 | Proof of delivery capture | System | |
| 15 | — | Delivery confirmed | System | |
| 16 | PRC-062 | Track empty container return | AI | |
| 17 | PRC-064 | Empty gate-in at depot | System | |
| 18 | PRC-065 | Inspect returned empty for damage | System | |
| 19 | PRC-224 | AI damage assessment (if damaged) | AI | |
| 20 | — | Damage gate: approve M&R or charge customer | Human | DECISION |
| 21 | — | Calculate D&D charges (triggers E2E-13 if overdue) | AI | |
| 22 | PRC-277 | Update depot inventory | AI | |

#### E2E-04: Export Container Flow (REDESIGNED — 8→22 steps)

Triggered per container when export booking is confirmed.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-025 | Equipment reservation | AI | |
| 2 | PRC-277 | Depot inventory check | AI | |
| 3 | PRC-061 | Container allocation from depot | AI | |
| 4 | PRC-276 | Depot gate-out (empty release) | System | |
| 5 | PRC-248 | Truck dispatch for empty delivery (if door terms) | AI | |
| 6 | — | Shipper stuffing (physical) | External | |
| 7 | PRC-029 | VGM submission & validation | AI | |
| 8 | PRC-271 | Cut-off enforcement check | AI | |
| 9 | PRC-272 | Late arrival exception (if after cut-off) | AI | |
| 10 | — | Cut-off gate: allow late or roll cargo | Human | DECISION |
| 11 | PRC-064 | Terminal gate-in | System | |
| 12 | PRC-033 | DG classification check (if DG) | AI | |
| 13 | PRC-034 | DG segregation check (if DG) | AI | |
| 14 | PRC-043 | Stowage position assignment | AI | |
| 15 | PRC-161 | Export customs declaration | AI | |
| 16 | — | Customs gate: hold response if examined | Human | EXCEPTION |
| 17 | PRC-084 | Container loaded on vessel | System | |
| 18 | PRC-030 | Tracking update — on board | AI | |
| 19 | PRC-062 | In-transit tracking | AI | |
| 20 | PRC-054 | ETA prediction for destination | AI | |
| 21 | PRC-030 | Tracking update — arrived destination | AI | |
| 22 | — | Triggers E2E-03 (import) at destination | System | |

#### E2E-05: Reefer Cargo Flow (REDESIGNED — 8→18 steps)

Triggered when booking confirmed with reefer equipment type.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-068 | PTI scheduling | AI | |
| 2 | — | PTI execution & result | System | |
| 3 | — | PTI gate: fail → repair/replace unit | Human | DECISION |
| 4 | — | Pre-cooling verification | System | |
| 5 | — | Shipper stuffing with temp requirement | External | |
| 6 | PRC-064 | Gate-in with reefer plug connection | System | |
| 7 | PRC-066 | Continuous temperature monitoring activated | AI | |
| 8 | PRC-043 | Reefer stowage (near power source) | AI | |
| 9 | PRC-084 | Loading on vessel + power connection | System | |
| 10 | PRC-067 | Temperature alert detection (continuous) | AI | |
| 11 | — | Temp alert gate: crew adjusts settings | Human | EXCEPTION |
| 12 | — | Power failure contingency (if genset fails) | AI | |
| 13 | PRC-084 | Discharge at destination | System | |
| 14 | PRC-069 | Cold chain verification report | AI | |
| 15 | PRC-248 | Reefer delivery to consignee | AI | |
| 16 | PRC-250 | Proof of delivery with temp log | System | |
| 17 | — | If damage: trigger E2E-10 (claims) | AI | |
| 18 | — | Reefer unit return & inspection | System | |

#### E2E-06: DG Cargo Flow (REDESIGNED — 8→18 steps)

Triggered when booking confirmed with DG cargo flag.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-033 | IMDG classification (UN number, class, PG) | AI | |
| 2 | — | DG acceptance gate: accept or reject booking | Human | DECISION |
| 3 | PRC-034 | Segregation check against other cargo | AI | |
| 4 | PRC-036 | Special cargo permit (if required by port) | AI | |
| 5 | — | Permit gate: verify port authority approval | Human | APPROVAL |
| 6 | PRC-031 | DG declaration validation (MSDS, DGN) | AI | |
| 7 | — | Documentation gate: shipper docs complete? | Human | APPROVAL |
| 8 | PRC-043 | DG stowage position per IMDG segregation | AI | |
| 9 | PRC-032 | DG manifest for port authority | AI | |
| 10 | PRC-161 | Customs filing with DG details | AI | |
| 11 | PRC-064 | Gate-in with DG handling protocols | Human | INPUT |
| 12 | PRC-084 | Loading with specialized equipment | Human | INPUT |
| 13 | — | Emergency response plan generation | AI | |
| 14 | PRC-084 | At-sea monitoring with crew awareness | System | |
| 15 | PRC-084 | Discharge with DG protocols | Human | INPUT |
| 16 | PRC-161 | Import customs with DG declaration | AI | |
| 17 | PRC-248 | DG delivery with transport safety | Human | INPUT |
| 18 | PRC-250 | POD with DG certificate handover | System | |

#### E2E-07: Transshipment Flow (REDESIGNED — 7→18 steps)

Triggered when vessel arrives at hub with TS cargo.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-099 | TS manifest matching — inbound to outbound | AI | |
| 2 | PRC-084 | Discharge TS containers from mother vessel | System | |
| 3 | PRC-063 | Yard slot optimization for TS cargo | AI | |
| 4 | PRC-233 | Connection risk monitoring | AI | |
| 5 | PRC-234 | Delay impact assessment | AI | |
| 6 | — | Connection gate: if at risk, prioritize | Human | DECISION |
| 7 | PRC-062 | Track container in TS yard | AI | |
| 8 | PRC-043 | Connecting vessel stowage plan | AI | |
| 9 | PRC-084 | Load onto connecting vessel | System | |
| 10 | — | Load gate: verify all TS containers loaded | Human | APPROVAL |
| 11 | PRC-030 | Tracking milestone update | AI | |
| 12 | PRC-236 | Through BL update with TS details | AI | |
| 13 | PRC-054 | Revised ETA at final destination | AI | |
| 14 | PRC-292 | Customer notification | AI | |
| 15 | PRC-100 | TS execution monitoring | AI | |
| 16 | PRC-097 | TS handling charge calculation | AI | |
| 17 | PRC-240 | Cost allocation | AI | |
| 18 | PRC-239 | TS performance metric update | AI | |

#### E2E-20: Empty Repositioning (REDESIGNED — 8→16 steps)

Triggered weekly or on imbalance detection.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-079 | Demand forecasting per location/type | AI | |
| 2 | PRC-277 | Depot inventory analysis (surplus/deficit) | AI | |
| 3 | PRC-080 | Repositioning route optimization | AI | |
| 4 | — | Street turn opportunity check | AI | |
| 5 | — | Repo gate: approve plan and budget | Human | APPROVAL |
| 6 | PRC-247 | Transport mode selection per repo move | AI | |
| 7 | PRC-021 | Book empties on vessel (below laden priority) | AI | |
| 8 | PRC-248 | Book trucks for inland repo | AI | |
| 9 | PRC-249 | Book rail for long-haul repo | AI | |
| 10 | PRC-062 | Track repo container movements | AI | |
| 11 | PRC-064 | Gate-in at destination depot | System | |
| 12 | PRC-065 | Inspect repositioned empties | System | |
| 13 | PRC-277 | Update depot inventory | AI | |
| 14 | PRC-240 | Cost allocation to trade lanes | AI | |
| 15 | PRC-134 | Repo budget variance analysis | AI | |
| 16 | PRC-239 | Repo performance metrics update | AI | |

#### E2E-13: Demurrage & Detention (REDESIGNED — 7→15 steps)

Triggered when container free time expires.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-064 | Free time calculation from gate events | AI | |
| 2 | — | D&D tariff lookup by port/customer/contract | AI | |
| 3 | — | D&D charge calculation | AI | |
| 4 | PRC-121 | D&D invoice generation | AI | |
| 5 | PRC-255 | Tax calculation on D&D | AI | |
| 6 | — | Customer notification with gate event proof | AI | |
| 7 | — | Customer dispute received? | System | |
| 8 | — | Waiver gate: AI recommends waive/enforce | Human | DECISION |
| 9 | PRC-016 | Complaint handling (if disputed) | AI | |
| 10 | — | Manager gate: approve waiver above threshold | Human | APPROVAL |
| 11 | PRC-126 | Cash application (if paid) | AI | |
| 12 | PRC-125 | Dunning (if unpaid) | AI | |
| 13 | PRC-128 | AR aging update | AI | |
| 14 | — | Write-off gate: approve if uncollectable | Human | APPROVAL |
| 15 | PRC-132 | Revenue recognition for D&D | AI | |

#### E2E-23: Container Leasing Lifecycle (NEW — 15 steps)

Triggered on lease agreement signing or fleet capacity shortfall.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-073 | Lease vs buy analysis | AI | |
| 2 | — | Lease gate: approve lease decision | Human | DECISION |
| 3 | PRC-070 | Lease agreement evaluation | AI | |
| 4 | — | Agreement gate: approve lease terms | Human | APPROVAL |
| 5 | PRC-071 | On-hire survey at delivery | Human | INPUT |
| 6 | PRC-277 | Add containers to fleet inventory | AI | |
| 7 | PRC-062 | Track leased containers (ongoing) | AI | |
| 8 | PRC-065 | Condition monitoring (ongoing) | AI | |
| 9 | PRC-074 | Lessor reconciliation (monthly) | AI | |
| 10 | — | Reconciliation gate: approve variance | Human | APPROVAL |
| 11 | PRC-129 | Lease payment processing | AI | |
| 12 | PRC-072 | Off-hire survey at return | Human | INPUT |
| 13 | — | Damage gate: agree M&R liability | Human | DECISION |
| 14 | PRC-278 | M&R coordination for lease return | AI | |
| 15 | PRC-074 | Final lessor settlement | AI | |

#### E2E-24: OOG & Special Cargo (NEW — 18 steps)

Triggered when booking has OOG/break-bulk/project cargo flag.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-035 | OOG handling assessment | AI | |
| 2 | PRC-306 | Break-bulk booking assessment | AI | |
| 3 | — | Acceptance gate: approve special cargo | Human | DECISION |
| 4 | PRC-307 | Project cargo planning | AI | |
| 5 | PRC-308 | Lashing & securing plan | AI | |
| 6 | — | Securing gate: approve lashing plan | Human | APPROVAL |
| 7 | PRC-036 | Special permit application | AI | |
| 8 | — | Permit gate: authority approval received | Human | APPROVAL |
| 9 | PRC-043 | Stowage for OOG (considering clearances) | AI | |
| 10 | PRC-064 | Gate-in with flat-rack/open-top | System | |
| 11 | — | Physical securing execution | Human | INPUT |
| 12 | PRC-084 | Loading with crane/heavy-lift | Human | INPUT |
| 13 | PRC-066 | In-transit monitoring (if breakbulk on deck) | AI | |
| 14 | PRC-084 | Discharge with specialized equipment | Human | INPUT |
| 15 | — | Lashing removal and survey | Human | INPUT |
| 16 | PRC-248 | Special transport delivery | AI | |
| 17 | PRC-250 | POD with condition report | System | |
| 18 | PRC-121 | Special cargo invoice (premium rates) | AI | |

### 4.4 Finance (5 flows)

#### E2E-14: Financial Month-End (REDESIGNED — 9→22 steps)

Triggered at month end (scheduled).

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-132 | Revenue accruals (% completion for in-transit) | AI | |
| 2 | PRC-133 | Cost center allocation | AI | |
| 3 | PRC-260 | FX gain/loss calculation | AI | |
| 4 | PRC-136 | Bank statement reconciliation | AI | |
| 5 | PRC-128 | AR aging analysis | AI | |
| 6 | PRC-135 | Journal entry generation (depreciation, amortization, FX) | AI | |
| 7 | — | Journal gate: dual authorization on manual journals | Human | APPROVAL |
| 8 | PRC-255 | Tax accrual calculation | AI | |
| 9 | PRC-245 | Alliance revenue sharing calculation (if applicable) | AI | |
| 10 | — | Intercompany elimination entries | AI | |
| 11 | PRC-134 | Budget variance analysis | AI | |
| 12 | PRC-139 | Budget variance monitoring report | AI | |
| 13 | — | Variance gate: explain material variances | Human | INPUT |
| 14 | PRC-140 | Close accounting period | System | |
| 15 | — | Close gate: authorize period lock | Human | APPROVAL |
| 16 | — | P&L report generation | AI | |
| 17 | — | Balance sheet generation | AI | |
| 18 | — | Cash flow statement | AI | |
| 19 | PRC-138 | Cash flow forecast update | AI | |
| 20 | — | Multi-entity consolidation | AI | |
| 21 | — | Management reporting package | AI | |
| 22 | — | Reporting gate: CFO review and sign-off | Human | APPROVAL |

#### E2E-15: Procure-to-Pay (REDESIGNED — 8→18 steps)

Triggered when requisition is approved.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-151 | Purchase requisition creation | Human | INPUT |
| 2 | — | Requisition gate: budget approval | Human | APPROVAL |
| 3 | PRC-160 | Vendor onboarding check (new vendor?) | AI | |
| 4 | PRC-153 | Vendor sourcing & quotation comparison | AI | |
| 5 | PRC-154 | Supplier scoring | AI | |
| 6 | — | Vendor gate: approve vendor selection | Human | DECISION |
| 7 | PRC-152 | Purchase order generation | AI | |
| 8 | — | PO gate: authorize PO (per DOA matrix) | Human | APPROVAL |
| 9 | PRC-155 | Goods receipt at warehouse/vessel | Human | INPUT |
| 10 | PRC-156 | Inventory update | AI | |
| 11 | PRC-129 | Vendor invoice receipt | System | |
| 12 | PRC-130 | Three-way match (PO → receipt → invoice) | AI | |
| 13 | PRC-098 | Invoice validation | AI | |
| 14 | — | Match gate: approve if discrepancy | Human | APPROVAL |
| 15 | PRC-255 | WHT calculation (if foreign vendor) | AI | |
| 16 | PRC-131 | Payment scheduling per terms | AI | |
| 17 | PRC-261 | FX hedging (if foreign currency) | AI | |
| 18 | PRC-131 | Payment execution + remittance | System | |

#### E2E-09: Bunker Procurement (REDESIGNED — 8→18 steps)

Triggered on bunker requirement or voyage planning.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-297 | Current ROB assessment | AI | |
| 2 | PRC-048 | Consumption forecast for next legs | AI | |
| 3 | PRC-047 | Optimal bunkering port identification | AI | |
| 4 | — | Bunkering gate: approve port and quantity | Human | APPROVAL |
| 5 | PRC-153 | Bunker tender to approved suppliers | AI | |
| 6 | PRC-154 | Supplier bid evaluation | AI | |
| 7 | — | Supplier gate: approve PO award | Human | APPROVAL |
| 8 | PRC-152 | Bunker PO generation | AI | |
| 9 | — | Physical delivery coordination | Human | INPUT |
| 10 | — | Quantity survey (BDN verification) | Human | INPUT |
| 11 | — | Quality testing (ISO 8217) | System | |
| 12 | — | Quality gate: accept or reject fuel | Human | DECISION |
| 13 | PRC-297 | Update ROB with new delivery | AI | |
| 14 | PRC-129 | Bunker invoice receipt | System | |
| 15 | PRC-130 | Three-way match (PO → BDN → invoice) | AI | |
| 16 | PRC-131 | Payment scheduling | AI | |
| 17 | PRC-298 | Consumption vs plan analysis (ongoing) | AI | |
| 18 | PRC-299 | Charter bunker clause settlement (if TC) | AI | |

#### E2E-25: Collections & Credit Control (NEW — 16 steps)

Triggered when invoice becomes overdue or credit limit breached.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-128 | AR aging analysis — identify overdue | AI | |
| 2 | PRC-011 | Credit limit utilization check | AI | |
| 3 | PRC-125 | Dunning — level 1 reminder | AI | |
| 4 | — | 7 days — auto-escalate | System | |
| 5 | PRC-125 | Dunning — level 2 warning | AI | |
| 6 | — | Collections gate: review and decide action | Human | DECISION |
| 7 | PRC-011 | Credit limit suspension (if warranted) | AI | |
| 8 | — | Booking hold notification | AI | |
| 9 | PRC-125 | Dunning — level 3 legal notice | AI | |
| 10 | — | Legal gate: authorize legal action | Human | APPROVAL |
| 11 | PRC-312 | Credit insurance claim (if insured) | AI | |
| 12 | PRC-016 | Complaint handling (if customer disputes) | AI | |
| 13 | — | Payment plan gate: approve installment terms | Human | APPROVAL |
| 14 | PRC-126 | Cash application (on payment received) | AI | |
| 15 | — | Write-off gate: approve bad debt write-off | Human | APPROVAL |
| 16 | PRC-135 | Bad debt journal entry | AI | |

#### E2E-26: Trade Finance & Letter of Credit (NEW — 15 steps)

Triggered when booking has L/C payment terms.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-251 | L/C receipt from advising bank | System | |
| 2 | PRC-251 | L/C terms checking against booking/contract | AI | |
| 3 | — | L/C gate: accept or request amendment | Human | DECISION |
| 4 | PRC-254 | Track L/C expiry and shipment deadline | AI | |
| 5 | PRC-026 | Ensure BL complies with L/C terms | AI | |
| 6 | PRC-121 | Invoice matching L/C requirements | AI | |
| 7 | PRC-252 | Document set preparation for bank | AI | |
| 8 | — | Document gate: review compliance | Human | APPROVAL |
| 9 | PRC-252 | Present documents to negotiating bank | System | |
| 10 | PRC-253 | Handle discrepancies (if any) | AI | |
| 11 | — | Discrepancy gate: amend L/C or accept | Human | DECISION |
| 12 | PRC-254 | Track bank acceptance | AI | |
| 13 | PRC-126 | Cash application (on L/C payment received) | AI | |
| 14 | PRC-260 | FX gain/loss if L/C in foreign currency | AI | |
| 15 | PRC-132 | Revenue recognition | AI | |

### 4.5 Compliance & Safety (5 flows)

#### E2E-10: Claims Lifecycle (REDESIGNED — 8→20 steps)

Triggered on incident report or cargo damage detection.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-179 | Incident investigation initiation | AI | |
| 2 | — | Incident gate: severity assessment | Human | DECISION |
| 3 | PRC-170 | Cargo claim registration | AI | |
| 4 | — | Survey appointment | Human | INPUT |
| 5 | — | Joint survey execution | Human | INPUT |
| 6 | PRC-170 | Claim documentation compilation | AI | |
| 7 | PRC-171 | Loss prevention analysis | AI | |
| 8 | — | Liability gate: accept or contest liability | Human | DECISION |
| 9 | PRC-295 | Insurance coverage check | AI | |
| 10 | PRC-169 | P&I notification | AI | |
| 11 | — | Negotiation with claimant/P&I | Human | INPUT |
| 12 | — | Settlement gate: approve amount | Human | APPROVAL |
| 13 | PRC-172 | Subrogation tracking (if third party liable) | AI | |
| 14 | PRC-131 | Settlement payment processing | AI | |
| 15 | PRC-313 | Credit insurance claim (if applicable) | AI | |
| 16 | PRC-315 | General Average declaration (if extreme case) | AI | |
| 17 | — | GA gate: approve GA declaration | Human | APPROVAL |
| 18 | PRC-135 | Claims reserve journal entry | AI | |
| 19 | PRC-174 | Risk register update | AI | |
| 20 | PRC-180 | Regulatory reporting (if required) | AI | |

#### E2E-19: ESG Reporting (REDESIGNED — 8→18 steps)

Triggered quarterly and at IMO/EU reporting deadlines.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-178 | Collect fuel consumption data from noon reports | AI | |
| 2 | PRC-049 | Calculate CO2 emissions per vessel | AI | |
| 3 | PRC-050 | CII rating calculation per vessel | AI | |
| 4 | PRC-188 | Carbon footprint calculation (fleet-wide) | AI | |
| 5 | PRC-176 | MARPOL compliance check (all annexes) | AI | |
| 6 | PRC-177 | Ballast water management compliance | AI | |
| 7 | — | CII gate: review D/E rated vessels, approve corrective plan | Human | DECISION |
| 8 | PRC-192 | Decarbonization tracking vs targets | AI | |
| 9 | PRC-187 | Scope 1, 2, 3 emissions inventory | AI | |
| 10 | PRC-189 | IMO DCS data submission | AI | |
| 11 | PRC-180 | EU MRV reporting | AI | |
| 12 | — | EU ETS allowance calculation | AI | |
| 13 | — | FuelEU Maritime compliance check | AI | |
| 14 | PRC-191 | Poseidon Principles alignment scoring | AI | |
| 15 | PRC-190 | TCFD scenario analysis | AI | |
| 16 | PRC-187 | Sustainability report generation (GRI format) | AI | |
| 17 | — | ESG gate: management review before publication | Human | APPROVAL |
| 18 | — | Third-party audit coordination | Human | INPUT |

#### E2E-11: Crew Change (REDESIGNED — 8→18 steps)

Triggered when crew rotation is due or certificate expiring.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-141 | Crew rotation planning (contract duration, rest hours, certs) | AI | |
| 2 | PRC-142 | Certificate expiry check for joining crew | AI | |
| 3 | — | Cert gate: verify all certificates valid | Human | APPROVAL |
| 4 | PRC-150 | Training requirements assessment | AI | |
| 5 | PRC-143 | Visa & port entry permit processing | Human | INPUT |
| 6 | — | Travel booking (flights, accommodation) | AI | |
| 7 | — | Medical examination & drug/alcohol screening | Human | INPUT |
| 8 | — | Medical gate: clear for duty | Human | APPROVAL |
| 9 | — | Physical crew change at port | Human | INPUT |
| 10 | — | Duty handover & vessel familiarization | Human | INPUT |
| 11 | PRC-142 | Certificate verification on board | AI | |
| 12 | PRC-145 | MLC compliance check (rest hours, conditions) | AI | |
| 13 | PRC-144 | Payroll adjustment (sign-on/sign-off dates) | AI | |
| 14 | — | Allotment setup for new crew | AI | |
| 15 | — | Crew list update | System | |
| 16 | PRC-145 | Flag state notification | System | |
| 17 | — | Departing crew repatriation | AI | |
| 18 | — | Leave pay calculation for departing crew | AI | |

#### E2E-29: Sanctions & Trade Compliance (NEW — 12 steps)

Triggered on sanctions list update or high-risk booking.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-309 | Screen all active customers against updated list | AI | |
| 2 | PRC-309 | Screen all active vendors against updated list | AI | |
| 3 | — | Match found? | AI | |
| 4 | — | Sanctions gate: investigate match (false positive?) | Human | DECISION |
| 5 | PRC-310 | Sanctioned party response (freeze if confirmed) | AI | |
| 6 | PRC-163 | Export license check for controlled goods | AI | |
| 7 | PRC-311 | Dual-use license management | AI | |
| 8 | — | License gate: verify valid license before shipment | Human | APPROVAL |
| 9 | PRC-162 | AEO compliance monitoring | AI | |
| 10 | PRC-180 | Regulatory reporting (if sanctions finding) | AI | |
| 11 | PRC-173 | Compliance audit trail update | AI | |
| 12 | PRC-174 | Risk register update | AI | |

#### E2E-30: Emergency & Salvage (NEW — 15 steps)

Triggered on critical incident (grounding, collision, fire, piracy).

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-314 | Emergency response activation | AI | |
| 2 | — | Emergency gate: confirm situation and authorize response | Human | DECISION |
| 3 | PRC-292 | Notify all affected parties (customers, agents, insurers) | AI | |
| 4 | PRC-169 | Insurance notification (P&I, H&M) | AI | |
| 5 | PRC-316 | Salvage coordination (if needed) | Human | INPUT |
| 6 | PRC-179 | Incident investigation | AI | |
| 7 | PRC-315 | General Average assessment | AI | |
| 8 | — | GA gate: declare GA? | Human | DECISION |
| 9 | PRC-315 | GA declaration & average adjuster appointment | AI | |
| 10 | — | Cargo interest notifications | AI | |
| 11 | PRC-180 | Regulatory reporting (flag state, port authority, IMO) | AI | |
| 12 | PRC-290 | Port/terminal coordination for damaged vessel | AI | |
| 13 | PRC-174 | Risk register update | AI | |
| 14 | PRC-170 | Claims registration for all affected cargo | AI | |
| 15 | — | Post-incident gate: approve corrective actions | Human | APPROVAL |

### 4.6 Commercial Strategy (4 flows)

#### E2E-31: Alliance & VSA Operations (NEW — 16 steps)

Triggered on VSA period start or alliance schedule change.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-242 | VSA agreement terms review | AI | |
| 2 | PRC-244 | Alliance schedule coordination | AI | |
| 3 | PRC-243 | Slot allocation calculation per voyage | AI | |
| 4 | — | Slot gate: approve slot purchase/sale plan | Human | APPROVAL |
| 5 | PRC-243 | Execute slot transactions | AI | |
| 6 | PRC-246 | Equipment interchange setup | AI | |
| 7 | PRC-062 | Track partner containers in our custody | AI | |
| 8 | PRC-084 | Cargo ops coordination on shared vessels | System | |
| 9 | PRC-245 | Revenue sharing calculation (per voyage) | AI | |
| 10 | — | Revenue gate: approve sharing statement | Human | APPROVAL |
| 11 | PRC-087 | Shared port cost allocation | AI | |
| 12 | PRC-129 | Partner invoice processing | AI | |
| 13 | PRC-131 | Partner payment settlement | AI | |
| 14 | PRC-134 | VSA performance analysis | AI | |
| 15 | — | Performance gate: continue/modify/exit VSA | Human | DECISION |
| 16 | PRC-117 | Market share impact assessment | AI | |

#### E2E-32: Liner Agency Operations (NEW — 15 steps)

Triggered when appointed as agent for another line.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-283 | Agency appointment agreement | Human | INPUT |
| 2 | — | Agency gate: approve appointment terms | Human | APPROVAL |
| 3 | PRC-284 | Port call handling for principal's vessel | AI | |
| 4 | PRC-081 | Pre-arrival on behalf of principal | AI | |
| 5 | PRC-085 | Husbandry coordination | Human | INPUT |
| 6 | PRC-284 | Cargo operations coordination | AI | |
| 7 | PRC-026 | Documentation on behalf of principal (if scope includes) | AI | |
| 8 | PRC-088 | DA estimation for principal | AI | |
| 9 | PRC-089 | DA reconciliation | AI | |
| 10 | PRC-016 | Customer service for principal's customers | Human | INPUT |
| 11 | PRC-108 | Commission calculation (per vessel call) | AI | |
| 12 | PRC-285 | Monthly commission settlement | AI | |
| 13 | — | Settlement gate: approve commission statement | Human | APPROVAL |
| 14 | PRC-121 | Commission invoice generation | AI | |
| 15 | PRC-126 | Cash application (on commission received) | AI | |

#### E2E-33: NVOCC & LCL Operations (NEW — 18 steps)

Triggered when LCL booking confirmed or consolidation planned.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-287 | LCL consolidation planning | AI | |
| 2 | PRC-228 | Route calculation for consolidated container | AI | |
| 3 | PRC-025 | Equipment reservation for consolidation | AI | |
| 4 | PRC-288 | CFS stuffing coordination | Human | INPUT |
| 5 | PRC-029 | VGM for consolidated container | AI | |
| 6 | PRC-286 | House BL generation (per LCL shipper) | AI | |
| 7 | PRC-026 | Master BL generation (CFS to CFS) | AI | |
| 8 | PRC-289 | House-to-master BL reconciliation | AI | |
| 9 | — | Documentation gate: verify all HBLs match MBL | Human | APPROVAL |
| 10 | PRC-161 | Customs declaration (master level) | AI | |
| 11 | PRC-064 | Gate-in consolidated container | System | |
| 12 | PRC-084 | Loading on vessel | System | |
| 13 | PRC-062 | In-transit tracking | AI | |
| 14 | PRC-084 | Discharge at destination | System | |
| 15 | PRC-161 | Import customs (master level) | AI | |
| 16 | PRC-288 | CFS destuffing | Human | INPUT |
| 17 | PRC-248 | Individual LCL deliveries | AI | |
| 18 | PRC-121 | Invoice per house BL | AI | |

#### E2E-34: Fleet Strategy & Renewal (NEW — 12 steps)

Triggered annually or at end of charter.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-303 | Fleet age and capacity analysis | AI | |
| 2 | PRC-057 | Fleet deployment needs assessment | AI | |
| 3 | PRC-110 | Demand forecast for fleet sizing | AI | |
| 4 | PRC-304 | S&P market evaluation | AI | |
| 5 | — | Strategy gate: buy/sell/charter/newbuild | Human | DECISION |
| 6 | PRC-305 | Newbuilding specification (if newbuild) | AI | |
| 7 | PRC-304 | Vessel valuation (if buy/sell) | AI | |
| 8 | — | Transaction gate: approve vessel acquisition/disposal | Human | APPROVAL |
| 9 | PRC-293 | Insurance for new vessel | AI | |
| 10 | PRC-294 | Premium calculation | AI | |
| 11 | PRC-135 | Asset accounting (capitalize or dispose) | AI | |
| 12 | PRC-057 | Updated fleet deployment plan | AI | |

### 4.7 Platform (1 flow)

#### E2E-35: Platform Administration (NEW — 15 steps)

Triggered on tenant signup or system health alert.

| Step | Process | Name | Executor | Gate? |
|------|---------|------|----------|-------|
| 1 | PRC-201 | Tenant provisioning | System | |
| 2 | PRC-202 | Entity setup (companies, branches) | AI | |
| 3 | PRC-203 | User provisioning | System | |
| 4 | PRC-204 | Role assignment | Human | INPUT |
| 5 | PRC-207 | Master data validation | AI | |
| 6 | PRC-208 | Data quality monitoring (ongoing) | AI | |
| 7 | PRC-205 | Workflow creation | AI | |
| 8 | PRC-206 | Notification routing setup | AI | |
| 9 | PRC-211 | AI agent configuration | AI | |
| 10 | PRC-209 | EDI message processing setup | AI | |
| 11 | PRC-210 | API health monitoring (continuous) | AI | |
| 12 | PRC-212 | Agent performance monitoring (continuous) | AI | |
| 13 | PRC-218 | System health monitoring (continuous) | AI | |
| 14 | PRC-219 | Backup management (scheduled) | System | |
| 15 | PRC-220 | Audit trail analysis (scheduled) | AI | |

---

## 5. TRANSACTION-TO-FLOW BINDING

Every business event auto-creates the correct E2E flow instance(s).

| Event | Entity | Primary Flow | Conditional Flows |
|-------|--------|-------------|-------------------|
| `booking.confirmed` | Booking | E2E-01 Booking-to-Cash | +E2E-05 (reefer), +E2E-06 (DG), +E2E-24 (OOG), +E2E-26 (L/C) |
| `booking.confirmed` | Container | E2E-04 Export (per container) | E2E-03 Import (at destination) |
| `voyage.created` | Voyage | E2E-02 Voyage Lifecycle | |
| `vessel.eta_24h` | Port Call | E2E-12 Port Call (per port) | |
| `vessel.arrived_hub` | Transshipment | E2E-07 + E2E-22 | +E2E-21 (feeder departure) |
| `charter.fixture_confirmed` | Charter | E2E-08 Charter Party | |
| `bunker.requirement` | Bunker | E2E-09 Bunker Procurement | |
| `incident.reported` | Incident | E2E-10 Claims | +E2E-30 (if critical) |
| `crew.rotation_due` | Crew | E2E-11 Crew Change | |
| `container.free_time_expired` | Container | E2E-13 D&D | |
| `scheduled.month_end` | Period | E2E-14 Month-End | |
| `requisition.approved` | Requisition | E2E-15 P2P | |
| `lead.created` | Lead | E2E-16 Customer Lifecycle | |
| `dry_dock.planned` | Vessel | E2E-17 Dry Dock | |
| `trade_route.approved` | Route | E2E-18 Trade Route Launch | |
| `scheduled.quarterly` | Period | E2E-19 ESG | |
| `scheduled.weekly` | Forecast | E2E-20 Empty Repo, E2E-27 Revenue Mgmt | |
| `feeder_schedule.published` | Feeder | E2E-21 Feeder Voyage | |
| `lease.signed` | Lease | E2E-23 Container Leasing | |
| `invoice.overdue` | Invoice | E2E-25 Collections | |
| `booking.lc_terms` | Booking | E2E-26 Trade Finance | |
| `vessel.inspection_due` | Vessel | E2E-28 Maritime Safety | |
| `sanctions_list.updated` | System | E2E-29 Sanctions | |
| `vsa.period_start` | VSA | E2E-31 Alliance Ops | |
| `agency.appointed` | Agency | E2E-32 Liner Agency | |
| `lcl_booking.confirmed` | LCL | E2E-33 NVOCC/LCL | |
| `scheduled.annual` | Fleet | E2E-34 Fleet Strategy | |
| `tenant.signup` | Tenant | E2E-35 Platform Admin | |

---

## 6. HUMAN GATE DESIGN

### Gate Types

| Type | When Used | UI | Example |
|------|-----------|-----|---------|
| **APPROVAL** | AI completed work, human confirms | Approve/Reject + AI recommendation | BL review, credit limit, PO authorization |
| **DECISION** | Multiple options, human chooses | Option cards with pros/cons | Roll vs wait, waive vs enforce D&D, charter strategy |
| **INPUT** | Human must provide information | Structured form with AI defaults | Survey results, negotiation outcome, physical inspection |
| **EXCEPTION** | AI can't proceed, needs help | Alert + context + recommended action | Customs hold, sanctions match, port congestion |

### SLA Enforcement

| Priority | Default SLA | Warning At | Escalation At | Auto-Approve |
|----------|-------------|-----------|---------------|--------------|
| Critical | 1 hour | 30 min | 1 hour | Never |
| High | 2 hours | 1 hour | 2 hours | If AI confidence > 95% AND amount < $5,000 |
| Normal | 4 hours | 2 hours | 4 hours | If AI confidence > 95% AND amount < $1,000 |
| Low | 24 hours | 12 hours | 24 hours | If AI confidence > 95% |

### Escalation Chain

`Assigned user → Direct manager → Department head → Operations director → CEO`

---

## 7. DB SCHEMA (NEW TABLES)

### pe_e2e_flow_instances

```sql
CREATE TABLE pe_e2e_flow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  e2e_flow_id VARCHAR(20) NOT NULL,        -- E2E-01, E2E-02, etc.
  entity_type VARCHAR(50) NOT NULL,         -- booking, container, vessel, etc.
  entity_id VARCHAR(100) NOT NULL,          -- BK-00123, CSIU1234567, etc.
  trigger_event VARCHAR(100) NOT NULL,      -- booking.confirmed, vessel.arrived, etc.
  status VARCHAR(30) NOT NULL DEFAULT 'active',  -- active, paused_at_gate, completed, failed, cancelled
  current_step_number INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL,
  parent_flow_instance_id UUID REFERENCES pe_e2e_flow_instances(id),
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_e2e_flow_tenant ON pe_e2e_flow_instances(tenant_id);
CREATE INDEX idx_e2e_flow_entity ON pe_e2e_flow_instances(entity_type, entity_id);
CREATE INDEX idx_e2e_flow_status ON pe_e2e_flow_instances(status);
CREATE INDEX idx_e2e_flow_parent ON pe_e2e_flow_instances(parent_flow_instance_id);
```

### pe_e2e_step_instances

```sql
CREATE TABLE pe_e2e_step_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  flow_instance_id UUID NOT NULL REFERENCES pe_e2e_flow_instances(id),
  step_number INTEGER NOT NULL,
  process_ref VARCHAR(20),                  -- PRC-xxx
  step_name VARCHAR(255) NOT NULL,
  executor_type VARCHAR(20) NOT NULL,       -- ai_agent, human, system, external
  agent_id VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  blocked_by_step_id UUID REFERENCES pe_e2e_step_instances(id),
  parallel_group VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_e2e_step_flow ON pe_e2e_step_instances(flow_instance_id);
CREATE INDEX idx_e2e_step_status ON pe_e2e_step_instances(status);
CREATE INDEX idx_e2e_step_process ON pe_e2e_step_instances(process_ref);
```

### pe_human_gates

```sql
CREATE TABLE pe_human_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  step_instance_id UUID NOT NULL REFERENCES pe_e2e_step_instances(id),
  flow_instance_id UUID NOT NULL REFERENCES pe_e2e_flow_instances(id),
  gate_type VARCHAR(20) NOT NULL,           -- approval, decision, input, exception
  assigned_to_role VARCHAR(100) NOT NULL,
  assigned_to_user_id UUID REFERENCES users(id),
  ai_recommendation JSONB DEFAULT '{}',
  presented_info JSONB DEFAULT '{}',
  sla_deadline TIMESTAMPTZ NOT NULL,
  escalation_to_role VARCHAR(100),
  escalation_to_user_id UUID REFERENCES users(id),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  decision VARCHAR(50),                     -- approved, rejected, option_selected, input_provided
  decision_data JSONB,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES users(id),
  auto_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_human_gate_assigned ON pe_human_gates(assigned_to_user_id, decision);
CREATE INDEX idx_human_gate_flow ON pe_human_gates(flow_instance_id);
CREATE INDEX idx_human_gate_sla ON pe_human_gates(sla_deadline) WHERE decision IS NULL;
```

### pe_flow_events

```sql
CREATE TABLE pe_flow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  flow_instance_id UUID NOT NULL REFERENCES pe_e2e_flow_instances(id),
  step_instance_id UUID REFERENCES pe_e2e_step_instances(id),
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  cascaded_flow_ids TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flow_event_flow ON pe_flow_events(flow_instance_id);
CREATE INDEX idx_flow_event_type ON pe_flow_events(event_type);
CREATE INDEX idx_flow_event_created ON pe_flow_events(created_at);
```

### pe_event_triggers

```sql
CREATE TABLE pe_event_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type VARCHAR(100) NOT NULL,
  e2e_flow_id VARCHAR(20) NOT NULL,
  conditions JSONB DEFAULT '{}',
  entity_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_trigger_event ON pe_event_triggers(event_type) WHERE is_active = TRUE;
```

---

## 8. IMPLEMENTATION PHASES

### Phase 1: Process & Flow Data Rewrite (2-3 sessions)

| Session | Feature | Deliverable |
|---------|---------|-------------|
| 1 | F-016 | Add 63 new processes (PRC-228→PRC-316) to `operational-processes.ts` |
| 2 | F-017 | Rewrite `e2e-process-flows.ts` — 35 flows, 18-25 steps, PRC refs, gates |
| 3 | F-018 | Update types: `E2EFlowStep` with processRef, executorType, gateDefinition |

### Phase 2: Orchestrator Engine (3-4 sessions)

| Session | Feature | Deliverable |
|---------|---------|-------------|
| 4 | F-019 | DB migration — 5 new tables + Drizzle schema |
| 5 | F-020 | Event trigger engine — transaction events → flow creation |
| 6 | F-021 | Step executor — AI agent execution + human gate creation |
| 7 | F-022 | Human gate manager — notification, SLA, escalation |

### Phase 3: Live Monitoring UI (3-4 sessions)

| Session | Feature | Deliverable |
|---------|---------|-------------|
| 8 | F-023 | E2E Flow Monitor page — all active flows + progress |
| 9 | F-024 | Flow Detail page — step timeline, current position |
| 10 | F-025 | Human Gate Inbox — pending decisions, AI recommendations |
| 11 | F-026 | Transaction Process View — see all flows for any entity |

### Phase 4: AI Execution (2-3 sessions)

| Session | Feature | Deliverable |
|---------|---------|-------------|
| 12 | F-027 | AI agent execution service — Claude API for process steps |
| 13 | F-028 | AI gate preparation — analysis + recommendation before gates |
| 14 | F-029 | Proactive risk alerts — predict problems before they happen |

### Phase 5: Analytics (2 sessions)

| Session | Feature | Deliverable |
|---------|---------|-------------|
| 15 | F-030 | Process analytics dashboard |
| 16 | F-031 | AI performance tracking |

**Total: 16 sessions, 16 feature nodes (F-016 → F-031)**

---

## 9. METRICS — HOW WE KNOW IT'S WORKING

| Metric | Target |
|--------|--------|
| Process orphan rate | 0% (currently 35.7%) |
| E2E flow coverage | 290/290 processes mapped |
| Avg steps per flow | 18+ (currently ~8) |
| AI-executed steps | 70%+ of all steps |
| Human gate response time | < SLA deadline |
| Flow completion rate | > 95% |
| Average flow duration | < historical baseline |
| Proactive alert accuracy | > 80% |
