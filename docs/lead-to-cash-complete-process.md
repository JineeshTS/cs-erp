# Lead-to-Cash — Complete Process Flow

> **Purpose:** This is THE master process definition for the Process Hub.
> Every transaction enters this flow and moves step by step.
> Each step is marked: **MANUAL** (user does it), **AI** (agent does it), **GATE** (human approval required), or **SYSTEM** (automatic/event-driven).
> Scenario branches are explicitly defined at decision points.

---

## Flow Overview

```
LEAD CAPTURE → QUALIFICATION → OPPORTUNITY → QUOTATION → NEGOTIATION
→ CONTRACT → CUSTOMER ONBOARDING → BOOKING → PRE-SHIPMENT OPS
→ CARGO RECEIPT → CUSTOMS & COMPLIANCE → VESSEL LOADING → IN-TRANSIT
→ DESTINATION OPS → DOCUMENTATION → INVOICING → PAYMENT → CASH APPLICATION
→ REVENUE RECOGNITION → CLOSE
```

**Typical Timeline:** 3–90 days (spot: 3–14 days, contract: ongoing, new customer: 30–90 days to first booking)
**Entities Created:** Lead → Opportunity → Quote → Contract → Customer → Booking → BL → Invoice → Payment → Journal Entry

---

## PHASE 1: LEAD & CUSTOMER ACQUISITION

> **Scenario Branch:** New Customer vs. Existing Customer
> Existing customers skip to Phase 3 (Booking).

### Step 1.1 — Lead Capture
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Sales Rep / AI Lead Agent |
| **Process** | PRC-001 |
| **What happens** | Lead enters system via: (a) web inquiry form, (b) email parsing by AI, (c) trade show scan, (d) referral entry by sales rep, (e) carrier platform RFQ. AI enriches with company data (DUNS, trade lanes, volumes). |
| **Data captured** | Company name, contact, trade lanes of interest, estimated annual TEU, cargo types, current carrier(s), source channel |
| **AI Action** | Auto-enrich from company databases, detect duplicates, assign to sales territory |
| **Manual Action** | Sales rep reviews and corrects enriched data if entered manually |
| **Output** | Lead record created, status = "new" |

### Step 1.2 — Lead Scoring & Qualification
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Lead Scoring Agent |
| **Process** | PRC-002 |
| **What happens** | AI scores lead on: estimated revenue potential, trade lane fit (do we serve their routes?), cargo type compatibility, competitive position, company size/credit indicators. Score: 0–100. |
| **Scoring factors** | Trade lane coverage (30%), volume potential (25%), cargo type fit (20%), competitive win probability (15%), credit indicators (10%) |
| **Output** | Lead score assigned. If score ≥ 70 → auto-qualify. If 40–69 → flag for sales review. If < 40 → auto-park in nurture queue. |

### Step 1.3 — Sales Qualification Gate
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (decision) |
| **Who** | Sales Manager |
| **Process** | — |
| **Trigger** | Lead score 40–69 (borderline), or any lead flagged by AI |
| **AI Recommendation** | Agent prepares brief: "This lead operates 500 TEU/year on Jebel Ali–Chennai, which we cover. Current carrier is XYZ. Win probability: 62%. Recommend: QUALIFY." |
| **Decision options** | Qualify → Opportunity created / Reject → Lead archived / Defer → Back to nurture |
| **SLA** | 4 hours (normal priority) |
| **Skip condition** | Auto-qualified leads (score ≥ 70) skip this gate |

### Step 1.4 — Opportunity Creation
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Sales Rep + Opportunity Agent |
| **Process** | PRC-003 |
| **What happens** | Opportunity record created with: expected trade lanes, estimated volumes, target close date, competitive landscape. AI suggests similar won deals for reference. |
| **Manual Action** | Sales rep adds notes from customer conversation, adjusts estimated volumes |
| **AI Action** | Auto-populate trade lane details, suggest pricing strategy based on historical wins |
| **Output** | Opportunity created, status = "open", pipeline value calculated |

### Step 1.5 — Credit Pre-Assessment
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Credit Risk Agent |
| **Process** | PRC-010 |
| **What happens** | AI pulls external credit data (D&B, trade references), calculates preliminary credit score, suggests credit limit. For known defaulters or sanctioned entities → auto-reject. |
| **Checks** | Company registration verification, sanctions screening (OFAC/EU/UN), adverse media check, trade payment history |
| **Output** | Preliminary credit assessment: Green (auto-approve up to limit) / Amber (needs review) / Red (decline or cash-only terms) |

### Step 1.6 — Sanctions & Compliance Screening
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Compliance Screening Agent |
| **Process** | PRC-161 |
| **What happens** | Mandatory screening against OFAC, EU, UN, UK sanctions lists. Also screens beneficial owners, directors, and connected parties. |
| **Output** | CLEAR → proceed / HIT → escalate to compliance gate / POSSIBLE MATCH → manual review |

> **SCENARIO BRANCH — Sanctions Hit:**
> If HIT or POSSIBLE MATCH → Step 1.6a (Compliance Exception Gate)

### Step 1.6a — Compliance Exception Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (exception) |
| **Who** | Compliance Officer |
| **Trigger** | Sanctions screening returned HIT or POSSIBLE MATCH |
| **AI Recommendation** | Agent shows match details, confidence level, and whether it's a common name false positive |
| **Decision options** | Clear (false positive) / Block (confirmed hit, end process) / Escalate to Legal |
| **SLA** | 1 hour (critical priority) |

---

## PHASE 2: QUOTATION & CONTRACT

### Step 2.1 — Rate Calculation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Rate Optimizer Agent |
| **Process** | PRC-004 |
| **What happens** | AI calculates optimal rate based on: base tariff for trade lane, current market rates (SCFI/FBX benchmarks), vessel utilization on target sailings, customer volume commitment, competitive positioning, cargo type surcharges. |
| **Factors** | Ocean freight, BAF, CAF, THC origin, THC destination, BL fee, seal fee, VGM fee, ISPS, low sulfur surcharge, peak season surcharge (if applicable), war risk (if applicable) |
| **Output** | Proposed all-in rate per TEU/FEU with component breakdown |

> **SCENARIO BRANCH — Cargo Type Surcharges:**
> - Standard dry → base rate only
> - Reefer → + reefer surcharge + power supply charge
> - DG → + DG handling surcharge (varies by IMDG class)
> - OOG (out-of-gauge) → + OOG surcharge + special equipment
> - Breakbulk → custom pricing (manual)

### Step 2.2 — Quote Generation
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Sales Rep + Quote Agent |
| **Process** | PRC-004 |
| **What happens** | AI generates formal quotation document with: all charge components, validity period, terms & conditions, transit time, sailing schedule options. Sales rep reviews and may adjust margins. |
| **Manual Action** | Sales rep adjusts rate within authorized band (±5%), adds special terms, selects validity period (14/30/60 days) |
| **Output** | Quote PDF generated, sent to customer, status = "quoted" |

> **SCENARIO BRANCH — Rate Authority:**
> - Within sales rep's authorized band → auto-proceed
> - Below minimum margin threshold → Rate Approval Gate (Step 2.3)

### Step 2.3 — Rate Approval Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Commercial Manager / Pricing Head |
| **Trigger** | Rate below minimum margin threshold OR special terms requested |
| **AI Recommendation** | Agent shows: proposed rate vs. market benchmark, margin impact, customer lifetime value projection, competitive rate intelligence |
| **Decision options** | Approve rate / Counter-offer (suggest alternative) / Reject |
| **SLA** | 2 hours (high priority) |

### Step 2.4 — Negotiation Tracking
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI |
| **Who** | Sales Rep + Negotiation Agent |
| **Process** | PRC-005 |
| **What happens** | Customer may counter. Each round tracked: customer's counter-rate, our response, justification. AI suggests negotiation strategy based on walk-away point, customer's alternatives, and market conditions. |
| **Manual Action** | Sales rep logs each negotiation round, customer feedback |
| **AI Action** | Suggests counter-offers, calculates break-even point, flags when to walk away |
| **Output** | Either: agreed rate → proceed to contract, or lost → archive opportunity |

> **SCENARIO BRANCH — Spot vs. Contract:**
> - **Spot shipment** → Skip contract (Step 2.5), go directly to Phase 3 (Booking) with spot rate
> - **Contract/volume commitment** → Proceed to Step 2.5

### Step 2.5 — Contract Creation (for volume commitments)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Commercial Team + Contract Agent |
| **Process** | PRC-006 |
| **What happens** | AI generates contract from template: trade lanes, rates, volume commitments (MQC), validity period, payment terms, D&D free days, special conditions. |
| **Manual Action** | Commercial manager reviews terms, adds special clauses, adjusts payment terms |
| **AI Action** | Auto-populate from negotiation record, flag non-standard terms, calculate rebate tiers |
| **Contract Types** | Named Account Contract (NAC), Service Contract (SC), Tender/RFQ response, Freight All Kinds (FAK) |
| **Output** | Draft contract generated |

### Step 2.6 — Contract Legal Review Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Legal / Commercial Director |
| **Trigger** | Non-standard terms, high-value contracts (> threshold), or new trade lane commitments |
| **AI Recommendation** | Agent highlights deviations from standard template, risk clauses, liability exposure |
| **Decision options** | Approve / Request amendments / Reject |
| **SLA** | 24 hours (low priority for standard, 4 hours for urgent) |
| **Skip condition** | Standard contracts within template → auto-approved |

### Step 2.7 — Contract Execution
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Customer + Commercial Team |
| **What happens** | Contract sent to customer for signature (e-sign or wet ink). On signature: contract activated in system, rates loaded into tariff engine, volume tracking initiated. |
| **Manual Action** | Customer signs, commercial team counter-signs |
| **System Action** | Auto-activate rates, set up volume tracking, notify operations |
| **Output** | Contract status = "active", rates effective |

---

## PHASE 3: CUSTOMER ONBOARDING (new customers only)

> **Skip condition:** Existing customers with active accounts skip to Phase 4.

### Step 3.1 — KYC Document Collection
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI |
| **Who** | Customer / Onboarding Agent |
| **Process** | PRC-008, PRC-009 |
| **What happens** | Customer uploads: trade license, certificate of incorporation, beneficial ownership declaration, bank references, authorized signatory list. AI extracts and validates document data via OCR. |
| **Required Documents** | Trade license, CR/MOA, tax registration (VAT/GST), bank letter, authorized signatories, beneficial ownership form |
| **AI Action** | OCR extraction, document classification, data validation against company registries, expiry date tracking |
| **Manual Action** | Customer uploads documents via portal or email |
| **Output** | KYC package assembled, validation status per document |

### Step 3.2 — KYC Verification Gate
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Compliance / Credit Team |
| **Trigger** | KYC package complete |
| **AI Recommendation** | Agent shows: document verification summary, sanctions re-check, risk rating, recommended credit terms |
| **Decision options** | Approve / Request additional documents / Reject |
| **SLA** | 4 hours (normal priority) |

### Step 3.3 — Credit Limit Approval
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Credit Manager / CFO (for large limits) |
| **Process** | PRC-010 |
| **Trigger** | KYC approved |
| **AI Recommendation** | Proposed credit limit based on: annual volume × average rate, payment terms, credit score, industry benchmarks. Shows risk exposure analysis. |
| **Decision options** | Approve limit / Approve reduced limit / Cash-only terms / Reject |
| **SLA** | 4 hours (normal), 1 hour if customer waiting for first booking |
| **Delegation** | Limits up to $50K: Credit Analyst. $50K–$250K: Credit Manager. >$250K: CFO. |

### Step 3.4 — Account Setup
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM + AI |
| **Who** | System / Onboarding Agent |
| **Process** | PRC-008 |
| **What happens** | Customer account created: master data (addresses, contacts, communication preferences), billing setup (payment terms, currency, invoice delivery method), portal access provisioned, rate agreement linked, default free days set. |
| **System Action** | Generate customer code, create AR master, set up billing preferences, provision portal login |
| **AI Action** | Auto-configure based on similar customers in same trade, suggest optimal free days |
| **Output** | Customer account active, ready for booking |

---

## PHASE 4: BOOKING

### Step 4.1 — Booking Request
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI |
| **Who** | Customer (portal/email) / Booking Agent |
| **Process** | PRC-021 |
| **What happens** | Customer submits booking request with: origin/destination, cargo description, container type/quantity, preferred sailing date, weight/volume, freight terms (prepaid/collect), shipper/consignee details. AI validates and enriches. |
| **Channels** | Customer portal (self-service), email (AI-parsed), EDI (INTTRA/CargoSmart), phone (manual entry by agent) |
| **AI Action** | Validate trade lane coverage, check sailing availability, verify commodity code, flag DG/reefer/OOG, auto-detect if contract rate applies |
| **Manual Action** | Customer fills booking form; or booking agent enters on behalf |
| **Output** | Booking request created, status = "requested" |

> **SCENARIO BRANCHES at Booking:**
> - **Standard dry cargo** → proceed normally
> - **Reefer cargo** → triggers Reefer Sub-flow (Step 4.1a)
> - **DG cargo** → triggers DG Sub-flow (Step 4.1b)
> - **OOG/special cargo** → triggers OOG Sub-flow (Step 4.1c)
> - **Transshipment required** → triggers T/S routing (Step 4.1d)
> - **Breakbulk** → triggers manual pricing + special ops (Step 4.1e)

### Step 4.1a — Reefer Sub-flow (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Reefer Operations Agent |
| **Process** | PRC-073 (Reefer Monitoring) |
| **What happens** | Capture: required temperature range, ventilation settings, humidity, atmosphere control (CA/MA), commodity-specific pre-trip requirements. AI selects appropriate reefer unit from fleet. |
| **Additional checks** | PTI (Pre-Trip Inspection) scheduling, genset availability (if needed), reefer plug availability at origin/destination terminals, power supply requirements on vessel |
| **Output** | Reefer requirements captured, PTI scheduled, appropriate unit earmarked |

### Step 4.1b — DG Sub-flow (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | DG Compliance Agent |
| **Process** | PRC-033 (DG Classification) |
| **What happens** | Customer provides DG declaration (IMO form). AI classifies: IMDG class, UN number, packing group, proper shipping name, EmS. AI checks: vessel DG capacity, segregation requirements, port DG acceptance. |
| **Additional checks** | Segregation matrix validation (incompatible classes), limited quantity exemptions, stowage category (on deck/under deck), special equipment needs |
| **DG Gate** | If Class 1 (explosives), Class 6.1 (toxic), Class 7 (radioactive) → mandatory DG Approval Gate |
| **Output** | DG classification confirmed, stowage requirements set, DG manifest entry created |

### Step 4.1c — OOG Sub-flow (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI |
| **Who** | Special Cargo Team + OOG Agent |
| **Process** | PRC-039 |
| **What happens** | Dimensions captured (L×W×H, weight), AI checks: flat rack/open top availability, vessel cell guide compatibility, crane capacity at ports, lashing requirements, route clearance (bridges, tunnels for inland). |
| **Manual Action** | Customer provides dimension drawings, photos. Operations team reviews feasibility. |
| **Output** | Equipment type confirmed (FR/OT/special), rate calculated, feasibility confirmed |

### Step 4.1d — Transshipment Routing (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Routing Engine Agent |
| **Process** | PRC-228 |
| **What happens** | If no direct service: AI finds optimal transshipment route. Evaluates: hub options (Jebel Ali, Singapore, Colombo, etc.), feeder connections, total transit time, cost, connection reliability, dwell time risk. |
| **Output** | Routing option(s) with: legs, vessels, ETD/ETA per leg, T/S port, total transit, total cost |

### Step 4.2 — Credit Check
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Credit Risk Agent |
| **Process** | PRC-010 |
| **What happens** | Real-time credit check: current outstanding balance + this booking value vs. credit limit. Check payment behavior (overdue invoices). |
| **Output** | PASS → proceed / SOFT FAIL (near limit) → warn but proceed / HARD FAIL (over limit or overdue) → Credit Gate |

### Step 4.3 — Credit Approval Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Credit Controller |
| **Trigger** | Credit check HARD FAIL |
| **AI Recommendation** | Shows: current exposure, overdue invoices, payment history, customer lifetime value, recommendation (approve with conditions / hold / require prepayment) |
| **Decision options** | Approve (one-time override) / Approve with prepayment required / Hold booking / Reject |
| **SLA** | 2 hours (high priority — customer waiting) |

### Step 4.4 — Space & Equipment Check
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Capacity Agent + Equipment Agent |
| **Process** | PRC-024 (Space), PRC-025 (Equipment) |
| **What happens** | AI checks: (a) vessel capacity on target sailing — available slots, weight limit, reefer plugs. (b) Equipment availability at origin depot — container type, grade, special requirements. |
| **Output** | Space confirmed on vessel X / alternate sailing suggested / waitlisted. Equipment available at depot Y / repositioning needed. |

> **SCENARIO BRANCH — No Space:**
> - Alternate sailing offered → customer confirms → proceed
> - Waitlisted → monitor and confirm when space opens
> - Rolled to next vessel → cargo rollover process (PRC-038)

### Step 4.5 — Booking Confirmation
| Attribute | Value |
|-----------|-------|
| **Type** | AI + SYSTEM |
| **Who** | Booking Agent |
| **Process** | PRC-021 |
| **What happens** | All checks passed. System generates booking confirmation with: booking number, vessel/voyage, ETD/ETA, container pickup details, cut-off dates (documentation, VGM, cargo, vessel), rate summary. Sent to customer. |
| **System Action** | Allocate space on vessel, reserve equipment at depot, set cut-off calendar, trigger downstream processes |
| **AI Action** | Generate confirmation document, calculate cut-offs based on terminal rules |
| **Output** | Booking confirmed, status = "confirmed". **This is the trigger for the operational phase.** |

---

## PHASE 5: PRE-SHIPMENT OPERATIONS

### Step 5.1 — Empty Container Release
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM + AI |
| **Who** | Equipment Agent |
| **Process** | PRC-025 |
| **What happens** | Release order generated for empty pickup from depot. If customer picks up (merchant haulage) → release order sent. If carrier haulage → truck dispatch triggered. |
| **Output** | Release order number, pickup depot, container number(s) assigned |

> **SCENARIO BRANCH — Haulage Terms:**
> - **CY/CY (merchant haulage)** → Customer arranges own trucking
> - **Door/CY or Door/Door (carrier haulage)** → Step 5.1a (Truck Dispatch)
> - **ICD/CY (inland depot)** → Step 5.1b (ICD Operations)

### Step 5.1a — Truck Dispatch (carrier haulage)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Transport Agent |
| **Process** | PRC-248 |
| **What happens** | AI selects transport provider, optimizes route, schedules pickup. Driver receives mobile notification. |
| **Manual Action** | Operations may override provider selection based on local knowledge |
| **Output** | Truck assigned, pickup scheduled, driver notified |

### Step 5.2 — Cargo Stuffing & Weighing
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Customer / Warehouse |
| **What happens** | Customer stuffs cargo into container at factory/warehouse. Container sealed. Gross weight measured for VGM compliance. |
| **Manual Action** | Customer/warehouse performs stuffing, weighing |
| **System Action** | VGM submission received and validated (PRC-029) |
| **Output** | Container stuffed, VGM submitted |

> **SCENARIO BRANCH — VGM:**
> - VGM within tolerance → proceed
> - VGM exceeds max payload → Exception Gate (Step 5.2a)

### Step 5.2a — VGM Exception Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (exception) |
| **Who** | Operations Manager |
| **Trigger** | VGM exceeds container max payload OR significant discrepancy with declared weight |
| **Decision options** | Accept (within tolerance) / Reject (re-stuff required) / Require re-weighing |
| **SLA** | 1 hour (critical — cargo in transit to terminal) |

### Step 5.3 — Cut-off Monitoring
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Operations Agent |
| **Process** | PRC-270, PRC-271 |
| **What happens** | AI monitors approaching cut-offs: documentation cut-off, VGM cut-off, cargo cut-off, vessel cut-off. Sends alerts to customer at T-48h, T-24h, T-6h. |
| **Output** | Alerts sent. If cut-off missed → roll-over decision (Step 5.3a) |

### Step 5.3a — Cut-off Miss / Cargo Roll-Over (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (decision) + AI |
| **Who** | Operations Manager + Rollover Agent |
| **Process** | PRC-038 |
| **Trigger** | Cargo or documentation cut-off missed |
| **AI Recommendation** | Next available sailing, cost impact, customer notification draft |
| **Decision options** | Roll to next vessel (which one?) / Cancel booking / Request late acceptance from terminal |
| **SLA** | 1 hour (critical) |

---

## PHASE 6: TERMINAL & CUSTOMS

### Step 6.1 — Terminal Gate-In
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | Terminal / Gate System |
| **Process** | PRC-064 |
| **What happens** | Container arrives at terminal. Gate system captures: container number, seal number, condition (damage check), weight, truck/driver details. Auto-matched to booking. |
| **System Action** | Gate-in recorded, yard slot allocated, status updated to "at terminal" |
| **Output** | Container in terminal, equipment interchange receipt (EIR) generated |

### Step 6.2 — Export Customs Declaration
| Attribute | Value |
|-----------|-------|
| **Type** | AI + SYSTEM |
| **Who** | Customs Agent |
| **Process** | PRC-161 |
| **What happens** | AI prepares customs declaration: HS code classification, value declaration, export permit check. Submitted electronically to customs authority. |
| **AI Action** | Auto-classify HS codes from cargo description, validate against country-specific rules, check export restrictions |
| **Output** | Customs declaration submitted, awaiting clearance |

> **SCENARIO BRANCHES — Customs:**
> - **Cleared** → proceed to loading
> - **Query** → respond to customs query (Step 6.2a)
> - **Examination** → physical/scanner exam (Step 6.2b)
> - **Hold** → customs hold (Step 6.2c)

### Step 6.2a — Customs Query Response (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Customs Agent |
| **Trigger** | Customs authority requests additional information |
| **AI Action** | Drafts response based on available documentation |
| **Manual Action** | Customs broker reviews and submits |
| **Output** | Query responded, re-submitted for clearance |

### Step 6.2b — Customs Examination (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Customs Authority / Terminal |
| **Trigger** | Customs selects container for examination (random or risk-based) |
| **What happens** | Container moved to exam area. Physical or scanner exam conducted. Result: released / detained. |
| **Output** | Exam completed, customs status updated |

### Step 6.2c — Customs Hold Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (exception) |
| **Who** | Compliance Manager |
| **Trigger** | Customs detention or prohibition |
| **AI Recommendation** | Shows: reason for hold, historical resolution for similar cases, recommended action |
| **Decision options** | Provide documentation to resolve / Re-export / Abandon cargo / Escalate to legal |
| **SLA** | 1 hour (critical) |

### Step 6.3 — DG Compliance Check (if DG cargo)
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | DG Compliance Agent |
| **Process** | PRC-033 |
| **What happens** | Final DG segregation check against actual vessel load plan. Verify emergency equipment, fire-fighting readiness. |
| **Output** | DG clearance for loading confirmed / segregation conflict → re-plan |

### Step 6.4 — Stowage Planning
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Stowage Planning Agent |
| **Process** | PRC-043 |
| **What happens** | AI assigns bay/row/tier position considering: weight distribution, DG segregation, reefer plug location, port rotation (discharge sequence), OOG clearance, stability calculation. |
| **Output** | Stowage position assigned, bay plan updated |

### Step 6.5 — Vessel Loading
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | Terminal Operations |
| **Process** | PRC-084 |
| **What happens** | Container loaded onto vessel per bay plan. Loading sequence optimized by terminal. Actual position recorded. |
| **System Action** | Load confirmation, actual bay/cell position recorded, vessel manifest updated |
| **Output** | Container loaded, status = "on board" |

---

## PHASE 7: DOCUMENTATION

### Step 7.1 — Shipping Instructions Processing
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Documentation Agent |
| **Process** | PRC-038 |
| **What happens** | Customer submits SI (shipper, consignee, notify party, cargo description, marks & numbers, payment terms). AI validates against booking, flags discrepancies. |
| **AI Action** | Cross-validate SI against booking data, check for restricted parties, verify HS codes match customs declaration |
| **Manual Action** | Customer submits via portal/email; documentation clerk reviews AI flags |
| **Output** | SI validated and accepted |

> **SCENARIO BRANCH — SI Discrepancy:**
> - Minor (name spelling, address format) → AI auto-corrects with notification
> - Major (different cargo, different consignee) → Booking Amendment required (PRC-022)

### Step 7.2 — Bill of Lading Generation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | BL Generation Agent |
| **Process** | PRC-026 |
| **What happens** | AI generates draft BL from SI + booking + cargo data. Populates: shipper, consignee, notify, vessel/voyage, POL/POD, cargo description, container details, freight terms. |
| **Output** | Draft BL generated |

### Step 7.3 — BL Review Gate
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (approval) |
| **Who** | Documentation Supervisor |
| **Process** | — |
| **Trigger** | Draft BL ready for review |
| **AI Recommendation** | Agent highlights: discrepancies with SI, unusual terms, freight calculation verification |
| **Decision options** | Approve / Request amendment / Reject |
| **SLA** | 2 hours (high priority — vessel sailing deadline) |

### Step 7.4 — BL Release Type Determination
| Attribute | Value |
|-----------|-------|
| **Type** | AI + SYSTEM |
| **Who** | Documentation Agent |
| **Process** | PRC-262 |
| **What happens** | Determine release type based on customer agreement, payment status, and trade lane practice. |

> **SCENARIO BRANCH — BL Type:**
> - **Original BL (negotiable)** → Print and courier originals to shipper
> - **Telex Release** → Electronic release at destination (shipper surrenders originals or waybill)
> - **Sea Waybill** → Non-negotiable, direct release to named consignee
> - **Express Release** → Immediate release, no original BL required
> - **Switch BL** → BL reissued at intermediate port with different details (for traders)

### Step 7.5 — Manifest Compilation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Manifest Agent |
| **Process** | PRC-028 |
| **What happens** | AI compiles vessel manifest from all confirmed BLs. Formats per destination country requirements (ISF for US, ENS for EU, ACI for Canada, AFR for Japan, etc.). |
| **Output** | Manifest submitted to authorities electronically |

---

## PHASE 8: IN-TRANSIT OPERATIONS

### Step 8.1 — Vessel Departure
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | Port Agent / System |
| **What happens** | Vessel departs. System records ATD (actual time of departure). All on-board containers status updated to "in transit". |
| **System Action** | ATD recorded, ETA recalculated, tracking activated, customer notification sent |
| **Output** | Vessel departed, tracking active |

### Step 8.2 — In-Transit Monitoring
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Tracking Agent + Performance Agent |
| **Process** | PRC-054 (ETA), PRC-051 (Noon Reports) |
| **What happens** | Continuous monitoring: vessel position, speed, weather on route, ETA updates. If reefer cargo: temperature monitoring alerts. AI analyzes noon reports for performance deviations. |
| **AI Action** | Predictive ETA updates, weather routing adjustments, anomaly detection |
| **Output** | Proactive ETA updates to customer, alerts on delays |

> **SCENARIO BRANCH — Transit Events:**
> - **Delay > 24h** → Customer notified, cascading ETA updates
> - **Port omission** → Cargo re-routing decision (GATE)
> - **Reefer alarm** → Reefer exception handling
> - **Container damage** → Claims process triggered (E2E-10)

### Step 8.3 — Transshipment Operations (if applicable)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + SYSTEM |
| **Who** | T/S Operations Agent |
| **Process** | PRC-097 |
| **What happens** | At T/S hub: container discharged from feeder/mother vessel, stored in yard, matched to connecting vessel, loaded. AI monitors connection risk (dwell time, vessel delays). |
| **AI Action** | Connection reliability monitoring, alternative vessel matching if missed connection, yard slot optimization |
| **Output** | Container transferred to connecting vessel, or re-routed if connection missed |

> **SCENARIO BRANCH — Missed Connection:**
> - Next available connection within 3 days → auto-rebook
> - No connection for 5+ days → Transshipment Exception Gate

---

## PHASE 9: DESTINATION OPERATIONS

### Step 9.1 — Pre-Arrival Filing
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Compliance Agent |
| **Process** | PRC-161 |
| **What happens** | AI files advance manifest/security declarations as required: ISF (US, 24h before loading), ENS (EU, before departure), ACI (Canada), AFR (Japan, 24h before arrival). |
| **Output** | Pre-arrival filings submitted |

### Step 9.2 — Vessel Arrival & Discharge
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | Terminal / Port Agent |
| **Process** | PRC-084 |
| **What happens** | Vessel arrives at destination. Containers discharged to yard. ATA (actual time of arrival) recorded. |
| **System Action** | ATA recorded, container locations updated, consignee/notify party notified, free time clock starts |
| **Output** | Container(s) available for collection, status = "discharged" |

### Step 9.3 — Import Customs Clearance
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL |
| **Who** | Customs Broker (customer's or ours) / Customs Agent |
| **Process** | PRC-161 |
| **What happens** | Import declaration filed. Duties/taxes calculated. Clearance obtained. |
| **Same scenario branches as export customs (cleared/query/exam/hold)** |
| **Output** | Customs cleared, container released for delivery |

### Step 9.4 — Cargo Delivery
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Customer / Transport |
| **What happens** | Customer collects (CY terms) or carrier delivers (door terms). Container gate-out recorded. |
| **Output** | Container delivered, gate-out recorded |

> **SCENARIO BRANCH — Delivery Terms:**
> - **CY (port)** → Customer picks up from terminal
> - **Door** → Carrier arranges last-mile delivery
> - **ICD (inland depot)** → Container railed/trucked to inland depot, then collected

### Step 9.5 — Empty Container Return
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + SYSTEM |
| **Who** | Customer / Depot |
| **Process** | PRC-064 |
| **What happens** | Customer returns empty container to designated depot. Depot inspects: damage, cleanliness, condition. |
| **Output** | Empty returned, EIR issued, damage noted (if any) |

> **SCENARIO BRANCH — Container Damage:**
> - No damage → close container use cycle
> - Damage found → M&R (maintenance & repair) process, cost recovery from customer or insurance

### Step 9.6 — Demurrage & Detention Calculation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | D&D Agent |
| **Process** | PRC-075 |
| **What happens** | AI calculates: demurrage (container at port beyond free days), detention (container outside port beyond free days). Based on: free days per contract/tariff, actual gate-in/gate-out timestamps, port/depot calendar. |
| **Output** | D&D charges calculated (may be zero if within free days) |

> **SCENARIO BRANCH — D&D Dispute:**
> - Customer accepts → added to invoice
> - Customer disputes → D&D Dispute Gate (Step 9.6a)

### Step 9.6a — D&D Dispute/Waiver Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (decision) |
| **Who** | Commercial Manager |
| **Trigger** | Customer disputes D&D charges or requests waiver |
| **AI Recommendation** | Shows: contractual free days, actual timeline, customer value, historical waiver pattern, recommended waiver % |
| **Decision options** | Charge full / Partial waiver (%) / Full waiver / Escalate |
| **SLA** | 4 hours (normal priority) |

---

## PHASE 10: INVOICING & REVENUE

### Step 10.1 — Freight Invoice Generation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Invoice Generation Agent |
| **Process** | PRC-121 |
| **What happens** | AI generates invoice from: booking rate (contract/spot), actual quantities, surcharges, D&D charges, additional services. Applies: correct tax jurisdiction, currency, payment terms per contract. |
| **Output** | Invoice generated, PDF created |

> **SCENARIO BRANCH — Freight Terms:**
> - **Prepaid** → Invoice to shipper (origin)
> - **Collect** → Invoice to consignee (destination)
> - **Third-party billing** → Invoice to nominated payer
> - **Split billing** → Ocean freight to shipper, local charges to consignee

### Step 10.2 — Tax Calculation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Tax Compliance Agent |
| **Process** | PRC-255 |
| **What happens** | AI applies correct tax treatment per jurisdiction: VAT/GST on local charges, zero-rating for international freight, withholding tax rules, reverse charge mechanisms. Multi-entity tax calculation for intercompany. |
| **Output** | Tax amounts calculated, tax invoice compliant with local regulations |

### Step 10.3 — Invoice Delivery
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | System |
| **What happens** | Invoice delivered per customer preference: email PDF, portal, EDI, or printed. |
| **Output** | Invoice sent to customer, AR entry created, aging clock starts |

> **SCENARIO BRANCH — Invoice Dispute:**
> - Customer accepts → proceed to payment
> - Customer disputes → Credit/Debit Note process (Step 10.3a)

### Step 10.3a — Invoice Dispute Resolution (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | MANUAL + AI + GATE |
| **Who** | Finance Team / Commercial Team |
| **Process** | PRC-032 |
| **What happens** | Customer raises dispute (rate difference, missing service, incorrect charges). AI analyzes: compare invoice vs. contract/booking, identify discrepancy. |
| **AI Action** | Root cause analysis of discrepancy, suggests resolution (credit note amount, adjustment) |
| **Manual Action** | Finance reviews AI findings, customer communication |
| **Gate** | Credit notes above threshold require Finance Manager approval |
| **Output** | Credit/debit note issued OR dispute rejected with explanation |

---

## PHASE 11: PAYMENT & CASH APPLICATION

### Step 11.1 — Payment Monitoring
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Collections Agent |
| **Process** | PRC-125 |
| **What happens** | AI monitors payment due dates. Sends automated reminders: 7 days before due, on due date, 3/7/14/30 days overdue (dunning sequence). Adjusts tone and urgency per aging bucket. |
| **Output** | Payment reminders sent per dunning schedule |

> **SCENARIO BRANCH — Payment Terms:**
> - **Prepaid** → Payment required before BL release. If not paid: BL held, cargo held at destination.
> - **Credit terms (30/45/60/90 days)** → Normal collection cycle
> - **L/C (Letter of Credit)** → L/C Sub-flow (Step 11.1a)
> - **Cash Against Documents (CAD)** → Documents released on payment
> - **TT (Telegraphic Transfer)** → Bank transfer, standard collection

### Step 11.1a — L/C Sub-flow (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + MANUAL + GATE |
| **Who** | Trade Finance Agent / Treasury |
| **Process** | PRC-283 (Trade Finance) |
| **What happens** | L/C received from customer's bank. AI checks: L/C terms match contract, required documents list, expiry date, amount, amendments needed. Documents presented to bank within L/C deadline. |
| **AI Action** | L/C clause matching, discrepancy detection, document checklist generation |
| **Manual Action** | Treasury prepares and presents documents to bank |
| **Gate** | L/C discrepancy → Bank Discrepancy Gate (accept/amend/reject) |
| **Output** | L/C proceeds received, or documents returned for correction |

### Step 11.2 — Payment Receipt
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM + AI |
| **Who** | Cash Application Agent |
| **Process** | PRC-126 |
| **What happens** | Payment received (bank transfer, check, online). System records receipt. AI matches to outstanding invoice(s). |
| **Matching logic** | Reference number match → auto-apply. Amount match → auto-apply. Partial payment → apply to oldest invoice first (or per customer instruction). Overpayment → create credit balance. |
| **Output** | Payment applied to invoice(s), AR balance updated |

> **SCENARIO BRANCH — Payment Issues:**
> - **Exact match** → auto-applied, invoice closed
> - **Partial payment** → applied, balance remains open
> - **Overpayment** → credit balance created, notify customer
> - **Unidentified payment** → Cash Application Gate (Step 11.2a)
> - **Payment bounced** → Reverse application, re-age invoice, notify collections

### Step 11.2a — Cash Application Gate (conditional)
| Attribute | Value |
|-----------|-------|
| **Type** | GATE (input) |
| **Who** | AR Analyst |
| **Trigger** | Payment cannot be auto-matched to any invoice |
| **AI Recommendation** | Suggests most likely invoice matches based on amount, customer, timing |
| **Decision options** | Match to suggested invoice / Manual match / Request remittance advice from customer / Hold in suspense |
| **SLA** | 4 hours (normal priority) |

### Step 11.3 — Collections Escalation (if overdue)
| Attribute | Value |
|-----------|-------|
| **Type** | AI + GATE |
| **Who** | Collections Agent / Credit Controller |
| **Process** | PRC-125 |
| **Trigger** | Invoice overdue beyond threshold (e.g., 30 days) |
| **AI Action** | Escalation assessment: customer's total exposure, other overdue invoices, payment history, shipments in pipeline. Recommends: continue dunning / suspend bookings / place on credit hold / refer to legal. |
| **Gate** | Credit hold decision requires Credit Manager approval |
| **Output** | Appropriate collection action taken |

---

## PHASE 12: REVENUE RECOGNITION & CLOSE

### Step 12.1 — Revenue Recognition
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Revenue Recognition Agent |
| **Process** | PRC-132 |
| **What happens** | IFRS 15 five-step model applied: (1) identify contract, (2) identify performance obligations (PO), (3) determine transaction price, (4) allocate to POs, (5) recognize when PO satisfied. For shipping: revenue recognized over time (voyage percentage) or at point in time (delivery). |
| **Recognition timing** | POL loading (origin) → partial recognition / POD discharge (destination) → full recognition / Over voyage duration → proportional |
| **Output** | Revenue journal entry posted to GL |

### Step 12.2 — Voyage P&L Allocation
| Attribute | Value |
|-----------|-------|
| **Type** | AI |
| **Who** | Costing Agent |
| **Process** | PRC-059 |
| **What happens** | AI allocates revenue and costs to voyage: freight revenue, surcharge revenue, slot costs (if VSA), bunker costs (allocated per container-mile), port costs, agency fees, overhead allocation. |
| **Output** | Voyage P&L calculated, contribution margin per booking visible |

### Step 12.3 — GL Posting & Period Close
| Attribute | Value |
|-----------|-------|
| **Type** | AI + SYSTEM |
| **Who** | GL Agent |
| **Process** | PRC-121, PRC-132 |
| **What happens** | All journal entries posted: revenue, AR, tax liability, accruals for unbilled charges. Multi-entity/multi-currency handling. Intercompany entries if origin and destination are different legal entities. |
| **Output** | GL updated, transaction fully closed in books |

### Step 12.4 — Transaction Closure
| Attribute | Value |
|-----------|-------|
| **Type** | SYSTEM |
| **Who** | System |
| **What happens** | All steps complete: booking closed, BL marked as accomplished, invoice paid, revenue recognized, GL posted. Transaction marked complete in Process Hub. |
| **Output** | Flow status = "completed" |

---

## SCENARIO SUMMARY

| Scenario | Where it branches | Impact on flow |
|----------|------------------|----------------|
| New customer | Phase 1 (lead capture) | Adds qualification, onboarding, KYC, credit setup |
| Existing customer | Phase 4 (booking) | Skips Phases 1–3 entirely |
| Spot shipment | Step 2.4 | Skips contract (Phase 2.5–2.7), uses spot rate |
| Contract/volume | Step 2.4 | Full contract creation + legal review |
| Standard dry cargo | Step 4.1 | Straight through |
| Reefer cargo | Step 4.1a | PTI, temp monitoring, reefer plug checks |
| DG cargo | Step 4.1b | IMDG classification, segregation, DG approval |
| OOG cargo | Step 4.1c | Dimension checks, special equipment, feasibility |
| Breakbulk | Step 4.1e | Manual pricing, special ops |
| Direct service | Step 4.4 | Single vessel, no T/S |
| Transshipment | Step 4.1d + 8.3 | T/S routing, hub operations, connection risk |
| Merchant haulage | Step 5.1 | Customer arranges trucking |
| Carrier haulage | Step 5.1a | Carrier dispatches trucks |
| Prepaid freight | Step 10.1 | Shipper invoiced, BL held until paid |
| Collect freight | Step 10.1 | Consignee invoiced at destination |
| L/C payment | Step 11.1a | Full trade finance sub-flow |
| Credit terms | Step 11.1 | Standard collection cycle |
| Customs cleared | Step 6.2 | Straight through |
| Customs examined | Step 6.2b | Physical/scanner exam delay |
| Customs held | Step 6.2c | Exception gate, compliance escalation |
| VGM exceeded | Step 5.2a | Re-stuff or exception |
| Cut-off missed | Step 5.3a | Cargo rollover to next vessel |
| No space on vessel | Step 4.4 | Alternate sailing or waitlist |
| Credit over limit | Step 4.3 | Credit gate, prepayment, or hold |
| Invoice disputed | Step 10.3a | Credit/debit note process |
| Payment unmatched | Step 11.2a | Manual cash application |
| Sanctions hit | Step 1.6a | Compliance exception, possible block |
| D&D dispute | Step 9.6a | Waiver decision |

---

## HUMAN GATES SUMMARY (all approval/decision/exception points)

| Gate | Phase | Type | Default Assignee | SLA | Priority |
|------|-------|------|-----------------|-----|----------|
| Sales Qualification | 1.3 | Decision | Sales Manager | 4h | Normal |
| Sanctions Exception | 1.6a | Exception | Compliance Officer | 1h | Critical |
| Rate Approval | 2.3 | Approval | Commercial Manager | 2h | High |
| Contract Legal Review | 2.6 | Approval | Legal / Commercial Director | 24h | Low |
| KYC Verification | 3.2 | Approval | Compliance / Credit Team | 4h | Normal |
| Credit Limit | 3.3 | Approval | Credit Manager / CFO | 4h | Normal |
| Credit Check (booking) | 4.3 | Approval | Credit Controller | 2h | High |
| DG Approval | 4.1b | Approval | DG Compliance Officer | 2h | High |
| VGM Exception | 5.2a | Exception | Operations Manager | 1h | Critical |
| Cut-off / Rollover | 5.3a | Decision | Operations Manager | 1h | Critical |
| Customs Hold | 6.2c | Exception | Compliance Manager | 1h | Critical |
| BL Review | 7.3 | Approval | Documentation Supervisor | 2h | High |
| D&D Waiver | 9.6a | Decision | Commercial Manager | 4h | Normal |
| Credit Note | 10.3a | Approval | Finance Manager | 4h | Normal |
| Cash Application | 11.2a | Input | AR Analyst | 4h | Normal |
| Collections Escalation | 11.3 | Decision | Credit Manager | 2h | High |
| L/C Discrepancy | 11.1a | Exception | Treasury Manager | 2h | High |

**Total: 17 human gates across 12 phases**

---

## AI AGENTS INVOLVED

| Agent | Steps | Capability |
|-------|-------|-----------|
| Lead Intelligence Agent | 1.1, 1.2 | Lead enrichment, scoring, duplicate detection |
| Compliance Screening Agent | 1.6 | Sanctions screening, adverse media |
| Credit Risk Agent | 1.5, 3.3, 4.2 | Credit scoring, limit recommendation, real-time check |
| Rate Optimizer Agent | 2.1, 2.2, 2.3 | Market rate analysis, optimal pricing |
| Negotiation Agent | 2.4 | Strategy suggestion, break-even analysis |
| Contract Agent | 2.5 | Template generation, clause flagging |
| Onboarding Agent | 3.1, 3.4 | KYC processing, account setup |
| Booking Agent | 4.1, 4.4, 4.5 | Validation, enrichment, confirmation |
| Routing Engine Agent | 4.1d | Optimal routing, T/S options |
| Reefer Operations Agent | 4.1a | Temperature management, PTI scheduling |
| DG Compliance Agent | 4.1b, 6.3 | IMDG classification, segregation |
| OOG Agent | 4.1c | Dimension feasibility, equipment selection |
| Capacity Agent | 4.4 | Space allocation, utilization optimization |
| Equipment Agent | 4.4, 5.1 | Container assignment, depot management |
| Transport Agent | 5.1a | Truck dispatch, route optimization |
| Operations Agent | 5.3, 5.3a | Cut-off monitoring, rollover management |
| Customs Agent | 6.2 | HS classification, declaration filing |
| Stowage Planning Agent | 6.4 | Bay planning, weight distribution |
| Documentation Agent | 7.1, 7.2, 7.4 | SI processing, BL generation, manifest |
| Tracking Agent | 8.2 | ETA prediction, anomaly detection |
| T/S Operations Agent | 8.3 | Connection monitoring, re-routing |
| D&D Agent | 9.6 | Free time calculation, charge computation |
| Invoice Generation Agent | 10.1 | Rate application, charge compilation |
| Tax Compliance Agent | 10.2 | Multi-jurisdiction tax calculation |
| Collections Agent | 11.1, 11.3 | Dunning sequence, escalation assessment |
| Cash Application Agent | 11.2 | Payment matching, auto-application |
| Trade Finance Agent | 11.1a | L/C processing, discrepancy detection |
| Revenue Recognition Agent | 12.1 | IFRS 15 application, timing |
| Costing Agent | 12.2 | Voyage P&L allocation |
| GL Agent | 12.3 | Journal posting, multi-entity |

**Total: 30 AI agents across the full Lead-to-Cash flow**

---

## STEP COUNT SUMMARY

| Category | Count |
|----------|-------|
| Total main steps | 42 |
| Conditional sub-steps | 14 |
| **Total steps (all paths)** | **56** |
| AI-executed steps | 31 |
| Manual steps | 8 |
| System/automatic steps | 7 |
| Human gates | 17 |
| Scenario branches | 22 |
| Phases | 12 |

---

## PROCESS HUB VISUALIZATION

When a user initiates this flow, the Process Hub should show:

1. **Phase progress bar** — 12 phases, current phase highlighted
2. **Step timeline** — Each step as a card: green (completed), blue (in progress), yellow (at gate), gray (pending)
3. **Scenario indicator** — Active branches shown (e.g., "Reefer", "Transshipment", "L/C")
4. **Gate inbox** — Pending gates with SLA countdown
5. **AI activity log** — What each AI agent did, with expandable details
6. **Entity links** — Click through to the actual booking, BL, invoice, etc.
7. **Timeline view** — Expected vs. actual duration per step
8. **Risk alerts** — AI-flagged items (credit risk, customs risk, delay risk)
