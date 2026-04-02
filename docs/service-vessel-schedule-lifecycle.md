# Service & Vessel Schedule Lifecycle — Complete E2E Flow

> **Purpose:** This is THE foundational process for a container shipping line.
> Without a service schedule, there is no vessel to sail, no capacity to sell, no booking to accept, no revenue to earn.
> This flow defines how a liner service is born, maintained, and eventually retired.
> Every other E2E flow (Booking-to-Cash, Vessel Voyage Lifecycle, etc.) DEPENDS on this flow completing first.
>
> Each step is marked: **MANUAL** (user does it), **AI** (agent does it), **GATE** (human approval required), or **SYSTEM** (automatic/event-driven).

---

## Flow Overview

```
MARKET ANALYSIS → NETWORK DESIGN → SERVICE LOOP CREATION → ALLIANCE/VSA SETUP
→ FLEET DEPLOYMENT → VESSEL ASSIGNMENT → SCHEDULE DRAFTING → CANAL PLANNING
→ SCHEDULE VALIDATION → SCHEDULE PUBLICATION → CAPACITY ALLOCATION
→ RATE ACTIVATION → CUT-OFF CONFIGURATION → ONGOING MONITORING
→ DEMAND FORECASTING → BLANK SAILING / EXTRA LOADER → SCHEDULE AMENDMENT
→ ROUTE OPTIMIZATION → SERVICE REVIEW / RETIREMENT
```

**Typical Lifecycle:** 4–8 weeks (initial setup), then continuous (maintenance cycle repeats weekly/monthly)
**Entities Created:** Market Intelligence → Network Design → Service Loop → Slot Agreement → Deployment Decision → Vessel Schedule → Port Rotation → Trade Allocation → Loading List
**Trigger:** Manual (strategic decision by Commercial/Operations leadership)

---

## PHASE 1: MARKET ANALYSIS & DEMAND ASSESSMENT

> **Why this matters:** You don't launch a service because you have ships. You launch because there is cargo demand on a trade lane that you can serve profitably. Get this wrong and you burn millions per rotation.

### Step 1.1 — Trade Lane Demand Analysis
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Market Intelligence Agent |
| **Process** | PRC-101 |
| **Module** | Liner Trade Route Management → Market Intelligence |
| **What happens** | AI analyzes historical cargo volumes on target trade lane(s): origin/destination pairs, seasonal patterns, growth trends, commodity mix, container type demand (dry/reefer/DG). Pulls data from internal bookings + external sources (port statistics, trade indices). |
| **Data sources** | ltr_market_intelligence, ltr_port_pair_trade_lanes, cap_demand_forecasts, historical booking data |
| **Output** | Market demand report: annual TEU potential, seasonality chart, growth projection, cargo type breakdown |

### Step 1.2 — Competitive Landscape Assessment
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Market Intelligence Agent |
| **Process** | PRC-103 |
| **Module** | Liner Trade Route Management → Market Intelligence |
| **What happens** | AI maps competitor services on same trade lane: carriers operating, service frequency, transit times, port coverage, current market rates (SCFI/FBX index), capacity deployed. Identifies gaps and opportunities. |
| **Data sources** | ltr_market_intelligence (competitor records), external rate indices |
| **Output** | Competitive landscape report: carrier matrix, rate benchmarks, service comparison table, gap analysis |

### Step 1.3 — Trade Lane P&L Projection
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Commercial Intelligence Agent |
| **Process** | PRC-104 |
| **Module** | Liner Trade Route Management → Trade Lane P&L |
| **What happens** | AI builds financial projection: estimated revenue (volume × projected rate), estimated costs (vessel, bunker, port, agency, overhead), contribution margin, payback period. Sensitivity analysis on utilization (40%/60%/80%). |
| **Data sources** | ltr_trade_lane_pnl, fdp_fleet_financials |
| **Output** | P&L projection with three scenarios (conservative/base/optimistic), break-even utilization %, NPV calculation |

### Step 1.4 — Market Entry Decision Gate
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (decision) |
| **Who** | Commercial Director / Chief Commercial Officer |
| **Trigger** | Market analysis package complete (Steps 1.1-1.3) |
| **AI Recommendation** | Agent presents: demand score, competitive position, projected P&L, risk factors, recommended go/no-go |
| **Decision options** | Proceed to service design / Defer (reassess in 3 months) / Reject (insufficient demand) / Modify scope (different port pairs) |
| **SLA** | 24 hours (strategic decision — not urgent) |

---

## PHASE 2: SERVICE DESIGN

> **Scenario Branch:** Solo Operation vs. Alliance/VSA
> - Solo: company operates its own vessels on the service
> - Alliance/VSA: multiple carriers share vessels and capacity

### Step 2.1 — Network Design & Route Planning
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Network Planning Agent + Network Planners |
| **Process** | PRC-102 |
| **Module** | Fleet Deployment Planning → Network Designs |
| **What happens** | AI proposes optimal service configuration: port rotation order (considering geographic efficiency, port productivity, hinterland reach), round-trip days, number of vessels required, weekly vs fortnightly frequency. Planners refine based on commercial relationships and port slot availability. |
| **Routing factors** | Geographic distance, canal transit (Suez/Panama), piracy zones, weather patterns, port congestion history, feeder connections, transshipment hub proximity |
| **Output** | Network design document: port rotation, direction (eastbound/westbound), round-trip days, vessel count, weekly capacity TEU |

### Step 2.2 — Port Pair Analysis
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Trade Lane Agent |
| **Process** | PRC-103 |
| **Module** | Liner Trade Route Management → Port Pair Trade Lanes |
| **What happens** | AI analyzes each port pair in the proposed rotation: distance (NM), average transit time, competition intensity, volume potential, revenue per TEU, port stay hours, terminal productivity. |
| **Output** | Port pair matrix with economic scoring per O/D combination |

### Step 2.3 — Service Loop Creation
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI |
| **Who** | Network Planner + Service Design Agent |
| **Process** | PRC-102 |
| **Module** | Liner Trade Route Management → Service Loops |
| **What happens** | Create the official service loop record: loop code (e.g., "AUS1"), loop name (e.g., "Arabian Gulf – South Asia Express"), port rotation list, direction, frequency, effective date. AI auto-calculates round-trip days and vessel count from port distances and expected port stays. |
| **Data created** | ltr_service_loops record (status = "draft") |
| **Output** | Service loop defined, ready for vessel assignment |

### Step 2.4 — Alliance / VSA Negotiation (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI |
| **Who** | Commercial Team + Alliance Agent |
| **Process** | PRC-105 |
| **Module** | Liner Trade Route Management → Slot Agreements / Alliance Agreements |
| **What happens** | If alliance/VSA service: negotiate slot allocation per partner, cost sharing formula, vessel contribution schedule, revenue sharing or independent marketing. AI models different allocation scenarios. |
| **Conditional** | Only if service type = alliance or VSA. Skip for solo operations. |
| **Data created** | ltr_slot_agreements, ltr_alliance_agreements |
| **Output** | Alliance/VSA agreement terms finalized |

### Step 2.5 — Service Design Approval Gate
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | VP Operations / Network Planning Head |
| **Trigger** | Service loop created + alliance terms agreed (if applicable) |
| **AI Recommendation** | Agent shows: network impact analysis (cannibalization of existing services), fleet requirement, estimated annual contribution, operational complexity score |
| **Decision options** | Approve service design / Request modifications / Reject |
| **SLA** | 4 hours (high priority — downstream teams waiting) |

---

## PHASE 3: FLEET DEPLOYMENT

### Step 3.1 — Vessel Requirement Calculation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Fleet Optimizer Agent |
| **Process** | PRC-041 |
| **Module** | Fleet Deployment Planning → Fleet Utilizations |
| **What happens** | AI calculates: vessels needed = round-trip days / frequency (e.g., 35 days / 7 = 5 vessels). Considers: dry docking windows, weather margins, port congestion buffers. Models with existing fleet availability. |
| **Data sources** | fdp_fleet_utilizations, existing vessel schedules |
| **Output** | Vessel requirement: count, size range (TEU), speed requirement, fuel type compatibility |

### Step 3.2 — Vessel Selection & Assignment
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Fleet Deployment Agent + Fleet Manager |
| **Process** | PRC-045 |
| **Module** | Fleet Deployment Planning → Deployment Decisions |
| **What happens** | AI recommends vessels from own fleet based on: capacity match, speed, fuel efficiency, reefer plug count, DG capability, current deployment end date. Fleet manager reviews and confirms assignments. |
| **Data created** | fdp_deployment_decisions (one per vessel assigned) |
| **Output** | Vessel(s) assigned to service with deployment start dates |

> **SCENARIO BRANCH — Fleet Gap:**
> - Own fleet sufficient → proceed to Step 3.4
> - Fleet gap → Step 3.3 (Charter-In)

### Step 3.3 — Charter-In Decision (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI |
| **Who** | Chartering Team + Charter Agent |
| **Process** | PRC-045 |
| **Module** | Fleet Deployment Planning → Deployment Contracts |
| **What happens** | If own fleet insufficient: AI scans charter market for available vessels matching requirements. Evaluates: daily charter rate vs own vessel cost, period vs spot charter, vessel condition, flag state implications. |
| **Data created** | fdp_deployment_contracts (charter party terms) |
| **Output** | Charter-in vessel(s) secured with contract terms |

### Step 3.4 — Fleet Financial Assessment
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Fleet Financial Agent |
| **Module** | Fleet Deployment Planning → Fleet Financials |
| **What happens** | AI calculates: daily operating cost per vessel, TCE (Time Charter Equivalent) at projected utilization, break-even load factor, annual cost commitment. Compares own vessel vs charter economics. |
| **Data created** | fdp_fleet_financials records |
| **Output** | Financial assessment with TCE projections and sensitivity analysis |

### Step 3.5 — Fleet Deployment Approval Gate
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Fleet Director / COO |
| **Trigger** | Vessel selection complete + financial assessment ready |
| **AI Recommendation** | Shows: total annual fleet cost, TCE break-even, charter vs own cost comparison, fleet utilization impact, vessels being redeployed from other services (if any) |
| **Decision options** | Approve deployment plan / Modify vessel selection / Approve with charter conditions / Reject |
| **SLA** | 4 hours (high priority — charter market is time-sensitive) |
| **Delegation** | Up to 3 vessels: Fleet Director. 4+ vessels or >$10M annual: COO. |

---

## PHASE 4: SCHEDULE CREATION

### Step 4.1 — Port Window Negotiation
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Port Operations Team |
| **Process** | PRC-041 |
| **Module** | Schedule & Voyage Planning → Port Sequences |
| **What happens** | Negotiate berthing windows with each terminal in the rotation: preferred arrival day/time, berth allocation, guaranteed crane allocation, handling rates. Terminal booking confirmed. |
| **Data created** | svp_port_sequences (one per port in rotation) |
| **Output** | Port windows secured for all ports in rotation |

### Step 4.2 — Schedule Drafting
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Schedule Planning Agent + Planner |
| **Process** | PRC-042 |
| **Module** | Schedule & Voyage Planning → Service Schedules |
| **What happens** | AI creates draft schedule: calculates ETD/ETA for each port based on distances, planned speed, port window constraints, canal transit bookings. Builds 52-week proforma schedule. Planner reviews and adjusts for known disruptions (port holidays, dry dock windows). |
| **Data created** | svp_service_schedules (status = "draft") |
| **Output** | Draft schedule with all port ETD/ETA for initial 52 weeks |

### Step 4.3 — Canal Transit Planning (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Canal Planning Agent |
| **Module** | Schedule & Voyage Planning → Canal Transits |
| **What happens** | If route includes Suez or Panama Canal: AI plans transit slots, calculates transit fees, books convoy positions. For Panama: evaluates Neopanamax vs Panamax lock requirements. For Suez: northbound vs southbound convoy schedule. |
| **Conditional** | Only if route traverses a canal |
| **Data created** | svp_canal_transits |
| **Output** | Canal transit plan with booking confirmations and fee estimates |

### Step 4.4 — Speed & Fuel Analysis
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Performance Agent |
| **Module** | Schedule & Voyage Planning → Speed Fuel Analyses |
| **What happens** | AI calculates optimal speed for each leg: trade-off between transit time (customer service) and fuel consumption (cost). Models slow steaming, eco speed, and full speed scenarios. Factors in ECA (Emission Control Area) requirements. |
| **Data created** | svp_speed_fuel_analyses |
| **Output** | Speed profile per leg with fuel consumption forecast and emission estimate |

### Step 4.5 — Schedule Quality Validation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Schedule Validation Agent |
| **Process** | PRC-042 |
| **What happens** | AI validates draft schedule against: transit time competitiveness (vs competitors on same trade), port stay adequacy (enough time for cargo ops), speed feasibility (not exceeding vessel capability), buffer for delays (weather margin), cut-off compliance (enough time between cargo cut-off and sailing). |
| **Output** | Validation report: pass/fail per criterion, competitor transit time comparison, risk score |

### Step 4.6 — Schedule Publication Approval Gate
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Operations Director |
| **Trigger** | Schedule drafted + validated + all port windows confirmed |
| **AI Recommendation** | Shows: schedule vs competitor comparison, transit time ranking, fuel cost projection, risk assessment, estimated annual revenue at target utilization |
| **Decision options** | Approve for publication / Request speed adjustment / Request port rotation change / Hold (pending port window re-negotiation) |
| **SLA** | 2 hours (high priority — sales team needs schedule to sell) |

---

## PHASE 5: SCHEDULE PUBLICATION & ACTIVATION

### Step 5.1 — Schedule Publication
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | System |
| **Process** | PRC-042 |
| **Module** | Schedule & Voyage Planning → Service Schedules |
| **What happens** | Schedule status changed from "draft" → "active". Published to: customer portal, carrier website, INTTRA/CargoSmart platforms, EDI distribution to agents and customers. Service loop status updated to "active". |
| **System Action** | Update svp_service_schedules.status = "active", update ltr_service_loops.status = "active", trigger downstream capacity setup |
| **Output** | Schedule live and visible to market |

### Step 5.2 — Vessel Schedule Activation
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | System |
| **Module** | Capacity & Voyage Management → Vessel Schedules |
| **What happens** | Create vessel schedule records for each vessel in the rotation: link vessel to service, set validity period, capacity (TEU/weight), status = "active". This is the operational record that bookings are made against. |
| **Data created** | cap_vessel_schedules (one per vessel per rotation) |
| **Output** | Vessel schedules active, ready to accept bookings |

### Step 5.3 — Port Rotation Setup
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | System |
| **Module** | Capacity & Voyage Management → Port Rotations |
| **What happens** | Create port rotation records for each vessel schedule: port code, sequence number, ETA/ETD, terminal, berth, call purpose (load/discharge/both). These are the actual port calls that cargo operations reference. |
| **Data created** | cap_port_rotations (one per port call per vessel schedule) |
| **Output** | Port rotations configured for all vessels |

### Step 5.4 — Capacity Allocation
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Capacity Planning Agent + Commercial Team |
| **Module** | Capacity & Voyage Management → Trade Allocations |
| **What happens** | AI allocates total vessel capacity across: contract customers (committed volume), spot market (uncommitted), alliance partners (if VSA). Considers: historical demand by trade lane pair, seasonal patterns, contract MQC (Minimum Quantity Commitment). Commercial team adjusts based on strategy. |
| **Data created** | cap_trade_allocations |
| **Output** | Capacity allocated per trade lane pair, ready for booking control |

### Step 5.5 — Rate Activation
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Pricing Agent + Commercial Team |
| **Module** | Commercial Pricing Management |
| **What happens** | Load base freight rates and surcharges for the new service/trade lanes into the tariff engine. Set: FAK rates (general), NAC rates (named account), contract rates, surcharge schedule (BAF, CAF, THC, etc.). |
| **Output** | Rates loaded, quotation engine can now price bookings on this service |

### Step 5.6 — Cut-Off Configuration
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Operations Team |
| **Module** | Liner Operations Control → Cargo Cutoffs |
| **What happens** | Configure standard cut-off rules per port: documentation cut-off (hours before sailing), cargo receiving cut-off, VGM cut-off, DG cut-off, reefer cut-off. These drive customer deadlines for every booking. |
| **Data created** | loc_cargo_cutoffs |
| **Output** | Cut-off rules active, automated enforcement begins with first sailing |

---

## PHASE 6: ONGOING SCHEDULE MAINTENANCE (CONTINUOUS)

> **This phase repeats continuously as long as the service operates.**
> Each step may trigger independently based on business events.

### Step 6.1 — Schedule Performance Monitoring
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Performance Monitoring Agent |
| **Process** | PRC-055 |
| **Module** | Capacity & Voyage Management → Schedule Performances |
| **What happens** | AI continuously monitors: on-time arrival/departure at each port, port stay duration vs planned, speed maintained vs target, schedule reliability percentage. Flags deviations exceeding thresholds. |
| **Frequency** | Per vessel arrival (event-driven) |
| **Data from** | cap_schedule_performances |
| **Output** | Performance dashboard, deviation alerts, trend analysis |

### Step 6.2 — Demand Forecasting
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Demand Forecasting Agent |
| **Process** | PRC-044 |
| **Module** | Capacity & Voyage Management → Demand Forecasts |
| **What happens** | AI forecasts demand for upcoming 4-12 weeks: models based on booking trends, seasonal patterns, economic indicators, customer contract commitments. Identifies over/under capacity situations. |
| **Frequency** | Weekly (scheduled) |
| **Data created** | cap_demand_forecasts |
| **Output** | Demand forecast with confidence intervals, capacity gap/surplus alerts |

### Step 6.3 — Blank Sailing Decision (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + GATE (decision) |
| **Who** | Capacity Agent + Operations Director |
| **Process** | PRC-104 |
| **Module** | Liner Operations Control → Schedule Deviations |
| **Trigger** | Forecast shows utilization < 40% for upcoming sailing(s) |
| **What happens** | AI recommends blank sailing (cancelling a departure) when projected utilization is below break-even. Calculates: cost savings from blank sailing, revenue impact, customer disruption, cargo rollover plan. |
| **Gate** | Operations Director must approve blank sailing |
| **AI Recommendation** | Shows: projected load factor, cost of operating vs blanking, customer impact analysis, alternative sailing for affected cargo |
| **Decision options** | Approve blank sailing / Reject (operate despite low utilization) / Partial blank (skip select ports only) |
| **SLA** | 4 hours (normal — typically 2-4 weeks before sailing) |
| **Output** | Blank sailing confirmed → customer notifications sent, bookings rolled to next vessel |

### Step 6.4 — Extra Loader Decision (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + GATE (decision) |
| **Who** | Capacity Agent + Commercial Director + Fleet Director |
| **Trigger** | Demand exceeds capacity for 3+ consecutive sailings |
| **Module** | Fleet Deployment Planning → Vessel Swaps |
| **What happens** | AI recommends deploying an extra loader (additional vessel for one or more rotations). Calculates: incremental revenue, charter cost, port slot availability, crew/bunker requirements. |
| **Gate** | Joint approval from Commercial Director (revenue justification) and Fleet Director (vessel availability) |
| **Decision options** | Approve extra loader / Reject (manage with overbooking/rollover) / Approve with conditions |
| **SLA** | 4 hours (high priority — charter market moves fast) |
| **Output** | Extra loader deployed or rejected with rationale |

### Step 6.5 — Schedule Amendment
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Schedule Planner |
| **Module** | Schedule & Voyage Planning → Service Schedules |
| **What happens** | Update schedule for: port additions/removals, ETA/ETD adjustments, vessel swaps, seasonal speed changes. System cascades changes to all affected port rotations and notifies impacted customers. |
| **Output** | Amended schedule published, downstream records updated |

### Step 6.6 — Route Optimization
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Route Optimization Agent |
| **Module** | Liner Trade Route Management → Route Optimizations |
| **What happens** | AI periodically evaluates route efficiency: suggests port rotation reordering, port additions/removals, speed profile changes based on: actual performance data, fuel cost changes, demand shifts, port productivity changes. |
| **Frequency** | Monthly (scheduled) |
| **Data created** | ltr_route_optimizations |
| **Output** | Optimization recommendations with projected cost/revenue impact |

### Step 6.7 — Load Factor Reporting
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Revenue Analytics Agent |
| **Module** | Liner Operations Control → Load Factor Reports |
| **What happens** | AI generates load factor reports per vessel, per trade lane, per direction: actual TEU vs capacity, weight utilization, revenue per TEU, contribution margin. Identifies underperforming legs and revenue leakage. |
| **Frequency** | Per sailing (event-driven) |
| **Data created** | loc_load_factor_reports |
| **Output** | Load factor analysis with revenue optimization recommendations |

### Step 6.8 — Service Review / Retirement Decision (periodic)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (decision) |
| **Who** | Commercial Director + COO |
| **Trigger** | Quarterly service review or performance below threshold for 3 months |
| **AI Recommendation** | Agent presents: trailing 3-month P&L, utilization trend, market demand outlook, competitor activity, fleet redeployment options |
| **Decision options** | Continue as-is / Modify (change frequency/ports/vessels) / Suspend (temporarily halt) / Retire (permanently close service) |
| **SLA** | 48 hours (strategic — quarterly review cycle) |
| **Output** | Service continues, is modified, or is retired with wind-down plan |

---

## SCENARIO SUMMARY

| Scenario | Where it branches | Impact on flow |
|----------|------------------|----------------|
| Solo service | Step 2.4 | Skip alliance/VSA negotiation |
| Alliance/VSA service | Step 2.4 | Add slot agreement + alliance agreement creation |
| Own fleet sufficient | Step 3.2 | Skip charter-in (Step 3.3) |
| Fleet gap (charter needed) | Step 3.3 | Add charter negotiation + contract |
| Route includes canal | Step 4.3 | Add canal transit planning |
| No canal transit | Step 4.3 | Skip canal planning |
| Low utilization forecast | Step 6.3 | Blank sailing decision gate |
| High demand exceeds capacity | Step 6.4 | Extra loader decision gate |
| Service underperforming | Step 6.8 | Service modification or retirement |

---

## HUMAN GATES SUMMARY

| Gate | Phase | Type | Default Assignee | SLA | Priority |
|------|-------|------|-----------------|-----|----------|
| Market Entry Decision | 1.4 | Decision | Commercial Director | 24h | Low |
| Service Design Approval | 2.5 | Approval | VP Operations | 4h | High |
| Fleet Deployment Approval | 3.5 | Approval | Fleet Director / COO | 4h | High |
| Schedule Publication Approval | 4.6 | Approval | Operations Director | 2h | High |
| Blank Sailing Decision | 6.3 | Decision | Operations Director | 4h | Normal |
| Extra Loader Decision | 6.4 | Decision | Commercial Director + Fleet Director | 4h | High |
| Service Review / Retirement | 6.8 | Decision | Commercial Director + COO | 48h | Low |

**Total: 7 human gates across 6 phases**

---

## AI AGENTS INVOLVED

| Agent | Steps | Capability |
|-------|-------|-----------|
| Market Intelligence Agent | 1.1, 1.2 | Demand analysis, competitive landscape, market data |
| Commercial Intelligence Agent | 1.3, 6.7 | P&L projection, revenue analytics, pricing strategy |
| Network Planning Agent | 2.1 | Route design, network optimization |
| Trade Lane Agent | 2.2 | Port pair analysis, economic scoring |
| Service Design Agent | 2.3 | Service loop configuration, rotation calculation |
| Alliance Agent | 2.4 | Slot allocation modeling, partnership terms |
| Fleet Optimizer Agent | 3.1 | Vessel requirement calculation, fleet planning |
| Fleet Deployment Agent | 3.2 | Vessel selection and recommendation |
| Charter Agent | 3.3 | Charter market analysis, rate comparison |
| Fleet Financial Agent | 3.4 | TCE calculation, financial assessment |
| Schedule Planning Agent | 4.2 | Schedule drafting, ETD/ETA calculation |
| Canal Planning Agent | 4.3 | Canal transit booking, fee calculation |
| Performance Agent | 4.4, 6.1 | Speed/fuel optimization, performance monitoring |
| Schedule Validation Agent | 4.5 | Quality check, competitor comparison |
| Capacity Planning Agent | 5.4, 6.3, 6.4 | Allocation, blank sailing, extra loader analysis |
| Pricing Agent | 5.5 | Rate loading, tariff configuration |
| Demand Forecasting Agent | 6.2 | Volume prediction, seasonal modeling |
| Route Optimization Agent | 6.6 | Route improvement recommendations |
| Revenue Analytics Agent | 6.7 | Load factor analysis, revenue optimization |

**Total: 19 AI agents across the full Service & Vessel Schedule lifecycle**

---

## STEP COUNT SUMMARY

| Category | Count |
|----------|-------|
| Total main steps | 27 |
| Conditional sub-steps | 3 |
| **Total steps (all paths)** | **30** |
| AI-executed steps | 16 |
| Manual steps | 5 |
| System/automatic steps | 4 |
| AI + Manual steps | 5 |
| Human gates | 7 |
| Scenario branches | 9 |
| Phases | 6 |

---

## DOWNSTREAM DEPENDENCIES

Once this flow completes Phase 5 (Schedule Publication & Activation), the following E2E flows become enabled:

| Downstream Flow | Dependency | How it connects |
|-----------------|------------|-----------------|
| **E2E-01: Booking-to-Cash** | Needs active vessel schedule + rates | Step 4 (Booking) checks cap_vessel_schedules for available space |
| **E2E-02: Vessel Voyage Lifecycle** | Needs vessel assigned to service | voyage.created event triggers E2E-02 when vessel departs |
| **E2E-16: Customer Lifecycle** | Needs active trade lanes to quote | Quotation (Step 5) uses rates loaded in Phase 5.5 |
| **Lead-to-Cash** | Needs everything above | Phase 4 (Booking) requires schedule, capacity, and rates |

**This flow is the prerequisite for all revenue-generating operations.**

---

## INTEGRATION MAP — Module Pages

Each step connects to an EXISTING module page in the ERP. Users can execute steps manually by opening the linked page:

| Step | Module Page URL |
|------|----------------|
| 1.1 | `/liner-trade-route-management/market-intelligence` |
| 1.2 | `/liner-trade-route-management/market-intelligence` |
| 1.3 | `/liner-trade-route-management/trade-lane-pnl` |
| 2.1 | `/fleet-deployment-planning/network-designs` |
| 2.2 | `/liner-trade-route-management/port-pair-trade-lanes` |
| 2.3 | `/liner-trade-route-management/service-loops` |
| 2.4 | `/liner-trade-route-management/slot-agreements` |
| 3.1 | `/fleet-deployment-planning/fleet-utilizations` |
| 3.2 | `/fleet-deployment-planning/deployment-decisions` |
| 3.3 | `/fleet-deployment-planning/deployment-contracts` |
| 3.4 | `/fleet-deployment-planning/fleet-financials` |
| 4.1 | `/schedule-voyage-planning/port-sequences` |
| 4.2 | `/schedule-voyage-planning/service-schedules` |
| 4.3 | `/schedule-voyage-planning/canal-transits` |
| 4.4 | `/schedule-voyage-planning/speed-fuel-analyses` |
| 5.1 | `/schedule-voyage-planning/service-schedules` |
| 5.2 | `/capacity-voyage-management/vessel-schedules` |
| 5.3 | `/capacity-voyage-management/port-rotations` |
| 5.4 | `/capacity-voyage-management/trade-allocations` |
| 5.5 | `/commercial-pricing-management` |
| 5.6 | `/liner-operations-control/cargo-cutoffs` |
| 6.1 | `/capacity-voyage-management/schedule-performances` |
| 6.2 | `/capacity-voyage-management/demand-forecasts` |
| 6.3 | `/liner-operations-control/schedule-deviations` |
| 6.4 | `/fleet-deployment-planning/vessel-swaps` |
| 6.5 | `/schedule-voyage-planning/service-schedules` |
| 6.6 | `/liner-trade-route-management/route-optimizations` |
| 6.7 | `/liner-operations-control/load-factor-reports` |
