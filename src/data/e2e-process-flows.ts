import type { E2EProcessFlow } from "@/types/processes";

export const E2E_PROCESS_FLOWS: E2EProcessFlow[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-01: Booking-to-Cash
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-01",
    name: "Booking-to-Cash",
    description:
      "End-to-end revenue cycle from initial customer quotation through booking confirmation, shipping documentation, cargo movement, invoicing, and final payment collection. The backbone commercial flow of the shipping line.",
    steps: [
      {
        module: "Quotation Management",
        step: "Generate spot or contract rate quote based on trade lane, cargo type, and customer history",
        type: "ai",
      },
      {
        module: "Booking Management",
        step: "Customer confirms booking; system allocates space on selected voyage and assigns container",
        type: "system",
      },
      {
        module: "Documentation",
        step: "Generate draft Bill of Lading and shipping instructions for shipper review",
        type: "ai",
      },
      {
        module: "Container Operations",
        step: "Gate-in loaded container at origin terminal and verify seal integrity",
        type: "human",
      },
      {
        module: "Vessel Operations",
        step: "Load container per bay plan and confirm vessel departure",
        type: "system",
      },
      {
        module: "Documentation",
        step: "Issue original Bill of Lading and transmit advance manifest to destination customs",
        type: "ai",
      },
      {
        module: "Invoicing & Billing",
        step: "Generate freight invoice with all applicable surcharges and email to customer",
        type: "system",
      },
      {
        module: "Accounts Receivable",
        step: "Apply incoming payment against invoice and reconcile bank statement",
        type: "ai",
      },
    ],
    participatingModules: [
      "Quotation Management",
      "Booking Management",
      "Documentation",
      "Container Operations",
      "Vessel Operations",
      "Invoicing & Billing",
      "Accounts Receivable",
    ],
    aiAgents: [
      "Rate Optimizer Agent",
      "BL Generator Agent",
      "Cash Application Agent",
    ],
    handoffPoints: [
      "Quote accepted triggers booking creation",
      "Booking confirmed triggers container allocation",
      "Vessel departure triggers BL issuance",
      "BL issued triggers invoice generation",
      "Payment received triggers AR reconciliation",
    ],
    typicalTimeline: "14-45 days depending on trade lane",
    kpis: [
      "Quote-to-booking conversion rate",
      "Booking-to-cash cycle time (days)",
      "Invoice accuracy rate",
      "Days Sales Outstanding (DSO)",
      "Revenue per TEU",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-02: Vessel Voyage Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-02",
    name: "Vessel Voyage Lifecycle",
    description:
      "Complete vessel voyage from initial schedule planning and chartering through bunkering, cargo operations at each port, sailing, final discharge, and financial settlement of voyage P&L.",
    steps: [
      {
        module: "Schedule & Voyage Planning",
        step: "Design rotation with optimal port sequence, ETAs, and speed profile using weather routing",
        type: "ai",
      },
      {
        module: "Chartering",
        step: "Fix vessel on time charter or slot charter and execute charter party agreement",
        type: "human",
      },
      {
        module: "Bunker Management",
        step: "Procure and deliver bunker fuel at best-value port based on consumption forecast",
        type: "ai",
      },
      {
        module: "Terminal Operations",
        step: "Execute loading operations per stowage plan and confirm container tallies",
        type: "system",
      },
      {
        module: "Vessel Operations",
        step: "Monitor vessel in transit with noon reports, weather updates, and ETA recalculations",
        type: "system",
      },
      {
        module: "Terminal Operations",
        step: "Discharge cargo at destination port and reconcile outturn against manifest",
        type: "human",
      },
      {
        module: "Port Disbursement",
        step: "Collect and verify port disbursement accounts from agents at each call port",
        type: "ai",
      },
      {
        module: "Voyage Accounting",
        step: "Calculate voyage P&L with all revenue, bunker costs, port costs, and charter hire",
        type: "system",
      },
    ],
    participatingModules: [
      "Schedule & Voyage Planning",
      "Chartering",
      "Bunker Management",
      "Terminal Operations",
      "Vessel Operations",
      "Port Disbursement",
      "Voyage Accounting",
    ],
    aiAgents: [
      "Voyage Optimizer Agent",
      "Bunker Procurement Agent",
      "PDA Verification Agent",
    ],
    handoffPoints: [
      "Schedule published triggers charter requirements",
      "Vessel fixed triggers bunker planning",
      "Loading complete triggers sailing notification",
      "Vessel arrival triggers discharge planning",
      "Voyage complete triggers financial settlement",
    ],
    typicalTimeline: "7-60 days per round voyage",
    kpis: [
      "Voyage P&L margin",
      "Schedule reliability (% on-time arrivals)",
      "Bunker consumption vs plan variance",
      "Port productivity (moves/hour)",
      "Vessel utilization (TEU carried / capacity)",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-03: Import Container Flow
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-03",
    name: "Import Container Flow",
    description:
      "Inbound container lifecycle from vessel arrival at destination port through customs clearance, delivery to consignee, empty container return, and settlement of any detention and demurrage charges.",
    steps: [
      {
        module: "Vessel Operations",
        step: "Vessel arrives at berth; discharge containers per bay plan and confirm outturn report",
        type: "system",
      },
      {
        module: "Customs & Compliance",
        step: "Submit import manifest and customs entry; clear cargo through regulatory checks",
        type: "ai",
      },
      {
        module: "Container Tracking",
        step: "Track container status through port storage, customs hold, and release milestones",
        type: "system",
      },
      {
        module: "Delivery Management",
        step: "Dispatch truck for last-mile delivery to consignee warehouse",
        type: "human",
      },
      {
        module: "Container Operations",
        step: "Consignee destuffs cargo and returns empty container to designated depot",
        type: "human",
      },
      {
        module: "Equipment Management",
        step: "Inspect returned empty for damage; update container inventory and availability",
        type: "system",
      },
      {
        module: "Demurrage & Detention",
        step: "Calculate detention charges for late container return and generate invoice",
        type: "ai",
      },
      {
        module: "Accounts Receivable",
        step: "Collect outstanding D&D charges and reconcile against customer account",
        type: "system",
      },
    ],
    participatingModules: [
      "Vessel Operations",
      "Customs & Compliance",
      "Container Tracking",
      "Delivery Management",
      "Container Operations",
      "Equipment Management",
      "Demurrage & Detention",
      "Accounts Receivable",
    ],
    aiAgents: [
      "Customs Filing Agent",
      "Demurrage Calculator Agent",
      "Container Tracking Agent",
    ],
    handoffPoints: [
      "Discharge complete triggers customs filing",
      "Customs cleared triggers delivery dispatch",
      "Delivery confirmed triggers empty return tracking",
      "Empty returned triggers D&D calculation",
      "D&D invoice triggers AR collection",
    ],
    typicalTimeline: "3-21 days from vessel arrival to empty return",
    kpis: [
      "Customs clearance time (hours)",
      "Container dwell time at port (days)",
      "Delivery on-time rate",
      "Average detention days per container",
      "D&D collection rate",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-04: Export Container Flow
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-04",
    name: "Export Container Flow",
    description:
      "Outbound container lifecycle from booking confirmation through empty pickup, cargo stuffing, terminal gate-in, vessel loading, documentation issuance, and final freight invoicing.",
    steps: [
      {
        module: "Booking Management",
        step: "Confirm export booking with equipment type, weight, and vessel allocation",
        type: "system",
      },
      {
        module: "Equipment Management",
        step: "Release empty container from depot and dispatch to shipper for stuffing",
        type: "human",
      },
      {
        module: "Container Operations",
        step: "Shipper stuffs cargo, seals container, and submits Verified Gross Mass (VGM) declaration",
        type: "human",
      },
      {
        module: "Terminal Operations",
        step: "Loaded container gates in at terminal; system validates booking and VGM",
        type: "system",
      },
      {
        module: "Customs & Compliance",
        step: "File export customs declaration and obtain clearance for shipment",
        type: "ai",
      },
      {
        module: "Vessel Operations",
        step: "Load container on vessel per stowage plan and confirm on-board quantity",
        type: "system",
      },
      {
        module: "Documentation",
        step: "Issue Bill of Lading, packing list, and certificate of origin as required",
        type: "ai",
      },
      {
        module: "Invoicing & Billing",
        step: "Generate freight invoice including ocean freight, THC, documentation fees, and surcharges",
        type: "system",
      },
    ],
    participatingModules: [
      "Booking Management",
      "Equipment Management",
      "Container Operations",
      "Terminal Operations",
      "Customs & Compliance",
      "Vessel Operations",
      "Documentation",
      "Invoicing & Billing",
    ],
    aiAgents: [
      "BL Generator Agent",
      "Customs Filing Agent",
      "Rate Optimizer Agent",
    ],
    handoffPoints: [
      "Booking confirmed triggers empty release",
      "Container stuffed triggers gate-in process",
      "Gate-in complete triggers customs filing",
      "Customs cleared triggers vessel loading",
      "Vessel sailed triggers BL issuance and invoicing",
    ],
    typicalTimeline: "5-14 days from booking to vessel departure",
    kpis: [
      "Booking-to-gate-in lead time",
      "VGM compliance rate",
      "Export customs clearance time",
      "Documentation accuracy rate",
      "Container no-show rate",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-05: Reefer Cargo Flow
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-05",
    name: "Reefer Cargo Flow",
    description:
      "Temperature-controlled container lifecycle with pre-trip inspection, continuous monitoring, alert management, and claims processing for any cargo damage due to temperature excursions.",
    steps: [
      {
        module: "Booking Management",
        step: "Book reefer container with specific temperature setpoint, ventilation, and humidity requirements",
        type: "human",
      },
      {
        module: "Equipment Management",
        step: "Conduct Pre-Trip Inspection (PTI) on reefer unit to verify cooling and electrical systems",
        type: "system",
      },
      {
        module: "Container Operations",
        step: "Stuff perishable cargo and pre-cool container to required temperature before gate-in",
        type: "human",
      },
      {
        module: "Reefer Monitoring",
        step: "Continuously monitor temperature, humidity, and atmosphere via IoT sensors throughout transit",
        type: "ai",
      },
      {
        module: "Reefer Monitoring",
        step: "Detect temperature excursion and trigger automated alert to operations team and vessel crew",
        type: "ai",
      },
      {
        module: "Vessel Operations",
        step: "Vessel crew adjusts reefer unit settings or repositions container based on alert guidance",
        type: "human",
      },
      {
        module: "Delivery Management",
        step: "Deliver reefer container to consignee with unbroken cold chain documentation",
        type: "human",
      },
      {
        module: "Claims Management",
        step: "If cargo damaged, initiate cargo claim with temperature logs and survey report as evidence",
        type: "ai",
      },
    ],
    participatingModules: [
      "Booking Management",
      "Equipment Management",
      "Container Operations",
      "Reefer Monitoring",
      "Vessel Operations",
      "Delivery Management",
      "Claims Management",
    ],
    aiAgents: [
      "Reefer Monitor Agent",
      "Anomaly Detection Agent",
      "Claims Assessment Agent",
    ],
    handoffPoints: [
      "PTI passed triggers container release for stuffing",
      "Gate-in triggers reefer monitoring activation",
      "Temperature excursion triggers crew alert",
      "Delivery complete triggers cold chain report generation",
      "Damage detected triggers claims registration",
    ],
    typicalTimeline: "7-35 days including transit and delivery",
    kpis: [
      "PTI pass rate on first attempt",
      "Temperature excursion incidents per 1000 TEU",
      "Cold chain integrity rate",
      "Reefer cargo claim ratio",
      "Average reefer power cost per container",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-06: DG Cargo Flow
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-06",
    name: "DG Cargo Flow",
    description:
      "Dangerous goods handling lifecycle from initial screening and IMDG classification through segregation planning, regulatory documentation, emergency preparedness, and safe transport execution.",
    steps: [
      {
        module: "DG Management",
        step: "Screen booking request against DG acceptance policy and vessel class approvals",
        type: "ai",
      },
      {
        module: "DG Management",
        step: "Classify cargo per IMDG Code using UN number, class, packing group, and flash point",
        type: "ai",
      },
      {
        module: "Stowage Planning",
        step: "Plan container stowage position per IMDG segregation rules and vessel stability limits",
        type: "system",
      },
      {
        module: "Documentation",
        step: "Validate DG declaration, Material Safety Data Sheet, and dangerous goods note from shipper",
        type: "human",
      },
      {
        module: "Customs & Compliance",
        step: "File DG manifest with port authority and obtain hazmat handling permit",
        type: "system",
      },
      {
        module: "Emergency Preparedness",
        step: "Generate vessel-specific emergency response plan with EmS guide references for each DG class",
        type: "ai",
      },
      {
        module: "Terminal Operations",
        step: "Handle DG container with specialized equipment following port safety protocols",
        type: "human",
      },
      {
        module: "Vessel Operations",
        step: "Transport DG cargo with continuous compliance monitoring and crew awareness briefing",
        type: "human",
      },
    ],
    participatingModules: [
      "DG Management",
      "Stowage Planning",
      "Documentation",
      "Customs & Compliance",
      "Emergency Preparedness",
      "Terminal Operations",
      "Vessel Operations",
    ],
    aiAgents: [
      "DG Classifier Agent",
      "Segregation Planner Agent",
      "Emergency Response Agent",
    ],
    handoffPoints: [
      "DG screening approved triggers classification",
      "Classification complete triggers segregation planning",
      "Stowage plan approved triggers DG documentation",
      "Documentation verified triggers port authority filing",
      "Port clearance triggers terminal handling",
    ],
    typicalTimeline: "7-30 days including pre-shipment documentation",
    kpis: [
      "DG booking rejection rate",
      "IMDG classification accuracy",
      "Segregation violation incidents",
      "DG documentation error rate",
      "DG incident rate per 1000 TEU",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-07: Transshipment Flow
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-07",
    name: "Transshipment Flow",
    description:
      "Hub port transshipment lifecycle where containers are discharged from the mother vessel, stacked at the terminal, and reloaded onto a connecting feeder vessel for final destination delivery.",
    steps: [
      {
        module: "Transshipment Hub Management",
        step: "Receive advance transshipment manifest and match inbound containers to outbound connections",
        type: "system",
      },
      {
        module: "Terminal Operations",
        step: "Discharge transshipment containers from mother vessel and tally against manifest",
        type: "system",
      },
      {
        module: "Yard Management",
        step: "Stack containers in transshipment yard optimizing for feeder vessel connection timing",
        type: "ai",
      },
      {
        module: "Container Tracking",
        step: "Track container location and status through hub with real-time milestone updates",
        type: "system",
      },
      {
        module: "Stowage Planning",
        step: "Generate feeder vessel load plan incorporating transshipment and local export containers",
        type: "ai",
      },
      {
        module: "Terminal Operations",
        step: "Load transshipment containers onto connecting feeder vessel per load plan",
        type: "human",
      },
      {
        module: "Documentation",
        step: "Update through Bill of Lading with transshipment details and revised ETAs",
        type: "system",
      },
    ],
    participatingModules: [
      "Transshipment Hub Management",
      "Terminal Operations",
      "Yard Management",
      "Container Tracking",
      "Stowage Planning",
      "Documentation",
    ],
    aiAgents: [
      "Yard Optimization Agent",
      "Connection Planner Agent",
      "Stowage Optimizer Agent",
    ],
    handoffPoints: [
      "Manifest received triggers discharge planning",
      "Discharge complete triggers yard stacking",
      "Feeder vessel confirmed triggers load planning",
      "Loading complete triggers documentation update",
    ],
    typicalTimeline: "1-7 days hub dwell time",
    kpis: [
      "Transshipment dwell time (hours)",
      "Missed connection rate",
      "Transshipment moves per crane hour",
      "Yard utilization at hub",
      "Through BL accuracy rate",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-08: Charter Party Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-08",
    name: "Charter Party Lifecycle",
    description:
      "Full chartering cycle from market analysis and negotiation through fixture note, charter party execution, vessel operation under charter, off-hire tracking, and final hire settlement.",
    steps: [
      {
        module: "Chartering",
        step: "Analyze market conditions, freight indices, and vessel availability for chartering decision",
        type: "ai",
      },
      {
        module: "Chartering",
        step: "Negotiate charter terms including hire rate, duration, trading limits, and bunker clause",
        type: "human",
      },
      {
        module: "Chartering",
        step: "Execute fixture note with recap of main terms and issue charter party contract",
        type: "human",
      },
      {
        module: "Vessel Operations",
        step: "Deliver vessel to charterer at agreed port in agreed condition with on-hire survey",
        type: "human",
      },
      {
        module: "Vessel Operations",
        step: "Operate vessel under charter with continuous performance monitoring against CP warranties",
        type: "system",
      },
      {
        module: "Off-Hire Management",
        step: "Track and calculate off-hire periods for breakdowns, dry dock, or deviation",
        type: "ai",
      },
      {
        module: "Chartering",
        step: "Redeliver vessel to owner at agreed port with off-hire survey and bunker survey",
        type: "human",
      },
      {
        module: "Voyage Accounting",
        step: "Final settlement of hire, off-hire deductions, bunker adjustments, and speed claims",
        type: "system",
      },
    ],
    participatingModules: [
      "Chartering",
      "Vessel Operations",
      "Off-Hire Management",
      "Voyage Accounting",
    ],
    aiAgents: [
      "Market Analysis Agent",
      "Charter Rate Agent",
      "Off-Hire Calculator Agent",
    ],
    handoffPoints: [
      "Fixture confirmed triggers CP generation",
      "Vessel delivered triggers charter period start",
      "Off-hire event triggers deduction calculation",
      "Redelivery triggers final hire settlement",
    ],
    typicalTimeline: "3-24 months for time charter period",
    kpis: [
      "Charter rate vs market benchmark",
      "Off-hire days as % of charter period",
      "Speed/consumption claim value",
      "Charter party dispute rate",
      "Time to fixture (days from negotiation start)",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-09: Bunker Procurement
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-09",
    name: "Bunker Procurement",
    description:
      "Bunker fuel procurement lifecycle from consumption forecasting and supply planning through tendering, purchase order, physical delivery, quality testing, and cost reconciliation.",
    steps: [
      {
        module: "Bunker Management",
        step: "Forecast bunker consumption per vessel based on voyage plan, speed, and weather routing",
        type: "ai",
      },
      {
        module: "Bunker Management",
        step: "Identify optimal bunkering ports based on price differentials and schedule impact",
        type: "ai",
      },
      {
        module: "Procurement",
        step: "Issue bunker tender to approved suppliers at selected ports and evaluate bids",
        type: "system",
      },
      {
        module: "Procurement",
        step: "Award bunker purchase order to selected supplier with agreed specs and delivery window",
        type: "human",
      },
      {
        module: "Bunker Management",
        step: "Coordinate physical bunker delivery via barge or pipeline with quantity survey",
        type: "human",
      },
      {
        module: "Quality Management",
        step: "Test delivered bunker fuel sample against ISO 8217 specifications and flag non-compliance",
        type: "system",
      },
      {
        module: "Bunker Management",
        step: "Record Bunker Delivery Note (BDN) quantities and reconcile against purchase order",
        type: "ai",
      },
      {
        module: "Accounts Payable",
        step: "Process bunker invoice with three-way match (PO, BDN, quality certificate) and schedule payment",
        type: "system",
      },
    ],
    participatingModules: [
      "Bunker Management",
      "Procurement",
      "Quality Management",
      "Accounts Payable",
    ],
    aiAgents: [
      "Bunker Procurement Agent",
      "Consumption Forecast Agent",
      "Invoice Matching Agent",
    ],
    handoffPoints: [
      "Consumption forecast triggers supply planning",
      "Tender awarded triggers PO creation",
      "Delivery confirmed triggers quality testing",
      "Quality approved triggers invoice processing",
    ],
    typicalTimeline: "3-10 days from planning to delivery",
    kpis: [
      "Bunker cost per metric ton vs market average",
      "Fuel quality non-compliance rate",
      "BDN quantity variance (%)",
      "Supplier delivery on-time rate",
      "Bunker invoice processing cycle time",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-10: Claims Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-10",
    name: "Claims Lifecycle",
    description:
      "End-to-end claims management from initial incident reporting and cargo survey through claim registration, liability assessment, negotiation with P&I club, and financial settlement or recovery.",
    steps: [
      {
        module: "Incident Management",
        step: "Log incident report with details of cargo damage, shortage, or delay at point of discovery",
        type: "human",
      },
      {
        module: "Claims Management",
        step: "Appoint independent cargo surveyor and coordinate joint inspection at origin or destination",
        type: "human",
      },
      {
        module: "Claims Management",
        step: "Register formal claim with surveyor report, BL, invoice, and packing list as supporting docs",
        type: "system",
      },
      {
        module: "Claims Management",
        step: "Assess liability using AI analysis of transport chain, deviation records, and container logs",
        type: "ai",
      },
      {
        module: "Claims Management",
        step: "Negotiate settlement amount with claimant or their P&I club representatives",
        type: "human",
      },
      {
        module: "Insurance Management",
        step: "Submit claim to P&I club or cargo insurer with full documentation package",
        type: "system",
      },
      {
        module: "Claims Management",
        step: "Execute settlement payment or initiate recovery action against responsible third party",
        type: "ai",
      },
      {
        module: "Accounts Payable",
        step: "Process settlement payment and record against voyage and customer accounts",
        type: "system",
      },
    ],
    participatingModules: [
      "Incident Management",
      "Claims Management",
      "Insurance Management",
      "Accounts Payable",
    ],
    aiAgents: [
      "Claims Assessment Agent",
      "Liability Analysis Agent",
      "Recovery Optimization Agent",
    ],
    handoffPoints: [
      "Incident reported triggers survey appointment",
      "Survey complete triggers claim registration",
      "Liability assessed triggers negotiation",
      "Settlement agreed triggers payment or recovery",
      "Insurance submitted triggers P&I follow-up",
    ],
    typicalTimeline: "30-365 days depending on claim complexity",
    kpis: [
      "Claims ratio (claims value / revenue)",
      "Average claim resolution time (days)",
      "Recovery rate on third-party claims",
      "Survey turnaround time",
      "Claims reserve accuracy",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-11: Crew Change
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-11",
    name: "Crew Change",
    description:
      "Crew rotation lifecycle from planning and travel arrangement through visa processing, embarkation at port, certificate verification, and payroll adjustment for onboard/offboard seafarers.",
    steps: [
      {
        module: "Crew Management",
        step: "Plan crew rotation schedule based on contract duration, rest hours, and certification expiry",
        type: "ai",
      },
      {
        module: "Travel Management",
        step: "Book flights and accommodation for joining and departing crew members",
        type: "system",
      },
      {
        module: "Crew Management",
        step: "Process visa applications and port entry permits for crew at change port",
        type: "human",
      },
      {
        module: "Crew Management",
        step: "Conduct pre-embarkation medical examination and drug/alcohol screening",
        type: "human",
      },
      {
        module: "Vessel Operations",
        step: "Execute physical crew change at port with proper handover of duties and vessel familiarization",
        type: "human",
      },
      {
        module: "Crew Management",
        step: "Verify all certificates of competency, STCW endorsements, and flag state approvals",
        type: "ai",
      },
      {
        module: "Payroll",
        step: "Adjust payroll for sign-on/sign-off dates, calculate leave pay, and process allotments",
        type: "system",
      },
      {
        module: "Compliance",
        step: "Update MLC records, crew list, and flag state notifications for regulatory compliance",
        type: "system",
      },
    ],
    participatingModules: [
      "Crew Management",
      "Travel Management",
      "Vessel Operations",
      "Payroll",
      "Compliance",
    ],
    aiAgents: [
      "Crew Planning Agent",
      "Certificate Verification Agent",
      "Travel Booking Agent",
    ],
    handoffPoints: [
      "Rotation plan triggers travel booking",
      "Visa approved triggers embarkation scheduling",
      "Crew change executed triggers payroll update",
      "Certificates verified triggers compliance filing",
    ],
    typicalTimeline: "14-30 days from planning to completed change",
    kpis: [
      "Crew change on-time rate",
      "Certificate expiry incidents (zero target)",
      "Travel cost per crew change",
      "Average crew tenure compliance with MLC",
      "Crew change cancellation rate",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-12: Port Call Management
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-12",
    name: "Port Call Management",
    description:
      "End-to-end port call process from pre-arrival notification and berth request through cargo operations, port services coordination, disbursement account settlement, and vessel departure.",
    steps: [
      {
        module: "Port Call Management",
        step: "Submit pre-arrival notification with crew list, cargo manifest, and dangerous goods declaration",
        type: "system",
      },
      {
        module: "Port Call Management",
        step: "Request berth allocation based on vessel dimensions, cargo type, and port schedule",
        type: "ai",
      },
      {
        module: "Port Agency",
        step: "Coordinate pilotage, towage, and mooring services for vessel arrival at berth",
        type: "human",
      },
      {
        module: "Terminal Operations",
        step: "Execute cargo discharge and loading operations with crane allocation and gang planning",
        type: "system",
      },
      {
        module: "Port Agency",
        step: "Arrange port services including fresh water, provisions, waste disposal, and shore leave",
        type: "human",
      },
      {
        module: "Port Disbursement",
        step: "Compile proforma disbursement account with all anticipated port charges and fees",
        type: "ai",
      },
      {
        module: "Port Call Management",
        step: "Obtain port clearance and coordinate departure with pilot station and VTS",
        type: "system",
      },
      {
        module: "Port Disbursement",
        step: "Finalize and verify actual disbursement account against proforma and settle with port agent",
        type: "ai",
      },
    ],
    participatingModules: [
      "Port Call Management",
      "Port Agency",
      "Terminal Operations",
      "Port Disbursement",
    ],
    aiAgents: [
      "Berth Optimizer Agent",
      "PDA Verification Agent",
      "Port Cost Estimator Agent",
    ],
    handoffPoints: [
      "Pre-arrival submitted triggers berth request",
      "Berth confirmed triggers pilot and towage booking",
      "Vessel berthed triggers cargo operations start",
      "Cargo complete triggers departure clearance",
      "Vessel sailed triggers PDA finalization",
    ],
    typicalTimeline: "12 hours to 5 days per port call",
    kpis: [
      "Port stay duration vs planned",
      "Berth waiting time (hours)",
      "Port disbursement variance (proforma vs actual)",
      "Cargo operations productivity",
      "Port call cost per TEU handled",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-13: Demurrage Management
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-13",
    name: "Demurrage Management",
    description:
      "Demurrage and detention charge management from container free time tracking through automated calculation, invoice generation, dispute handling, and final resolution or write-off.",
    steps: [
      {
        module: "Demurrage & Detention",
        step: "Track container free time at port and depot using gate-in/gate-out timestamps",
        type: "system",
      },
      {
        module: "Demurrage & Detention",
        step: "Calculate demurrage (at port) and detention (at customer) charges per tariff schedule",
        type: "ai",
      },
      {
        module: "Invoicing & Billing",
        step: "Generate D&D invoice with detailed breakdown of free days, excess days, and applicable rates",
        type: "system",
      },
      {
        module: "Customer Service",
        step: "Notify customer of pending D&D charges with supporting gate event documentation",
        type: "system",
      },
      {
        module: "Demurrage & Detention",
        step: "Receive and review customer dispute with waiver request and supporting evidence",
        type: "human",
      },
      {
        module: "Demurrage & Detention",
        step: "Evaluate waiver request against policy rules and historical customer value using AI recommendation",
        type: "ai",
      },
      {
        module: "Accounts Receivable",
        step: "Collect approved charges or process authorized waiver with management approval trail",
        type: "system",
      },
    ],
    participatingModules: [
      "Demurrage & Detention",
      "Invoicing & Billing",
      "Customer Service",
      "Accounts Receivable",
    ],
    aiAgents: [
      "Demurrage Calculator Agent",
      "Waiver Recommendation Agent",
      "Cash Application Agent",
    ],
    handoffPoints: [
      "Free time expired triggers D&D calculation",
      "D&D calculated triggers invoice generation",
      "Invoice issued triggers customer notification",
      "Dispute received triggers waiver evaluation",
      "Resolution agreed triggers AR action",
    ],
    typicalTimeline: "7-60 days from free time expiry to settlement",
    kpis: [
      "D&D revenue per TEU",
      "D&D invoice dispute rate",
      "Waiver percentage of total D&D billed",
      "Average time to dispute resolution (days)",
      "D&D collection rate",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-14: Financial Month-End
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-14",
    name: "Financial Month-End",
    description:
      "Monthly financial close process from revenue and cost accruals through account reconciliation, journal entry posting, period closure, management reporting, and multi-entity consolidation.",
    steps: [
      {
        module: "Revenue Accounting",
        step: "Calculate voyage revenue accruals using percentage-of-completion method for in-transit voyages",
        type: "ai",
      },
      {
        module: "Cost Accounting",
        step: "Accrue pending vendor invoices for bunkers, port costs, and agency fees not yet received",
        type: "ai",
      },
      {
        module: "General Ledger",
        step: "Reconcile bank statements, intercompany accounts, and subledger balances to GL",
        type: "system",
      },
      {
        module: "General Ledger",
        step: "Post adjusting journal entries for depreciation, amortization, and FX revaluation",
        type: "system",
      },
      {
        module: "General Ledger",
        step: "Review and approve all manual journal entries with dual-authorization sign-off",
        type: "human",
      },
      {
        module: "General Ledger",
        step: "Close accounting period and lock prior period from further postings",
        type: "system",
      },
      {
        module: "Financial Reporting",
        step: "Generate P&L, balance sheet, cash flow, and voyage performance reports",
        type: "ai",
      },
      {
        module: "Financial Reporting",
        step: "Consolidate multi-entity financials with intercompany elimination entries",
        type: "system",
      },
      {
        module: "Financial Reporting",
        step: "Present month-end package to management with variance analysis and commentary",
        type: "human",
      },
    ],
    participatingModules: [
      "Revenue Accounting",
      "Cost Accounting",
      "General Ledger",
      "Financial Reporting",
    ],
    aiAgents: [
      "Accrual Engine Agent",
      "Reconciliation Agent",
      "Variance Analysis Agent",
    ],
    handoffPoints: [
      "Accruals complete triggers reconciliation",
      "Reconciliation cleared triggers journal posting",
      "Journals approved triggers period close",
      "Period closed triggers report generation",
      "Reports generated triggers consolidation",
    ],
    typicalTimeline: "5-10 business days after month end",
    kpis: [
      "Days to close (target: under 5 working days)",
      "Number of post-close adjustments",
      "Reconciliation exception rate",
      "Accrual accuracy vs actual (variance %)",
      "Consolidation elimination accuracy",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-15: Procurement-to-Pay
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-15",
    name: "Procurement-to-Pay",
    description:
      "Full procurement cycle from purchase requisition through purchase order creation, goods or service receipt, three-way invoice matching, and vendor payment processing.",
    steps: [
      {
        module: "Procurement",
        step: "Submit purchase requisition with specifications, quantity, and budget code approval",
        type: "human",
      },
      {
        module: "Procurement",
        step: "Source vendors, compare quotations, and recommend award based on price, quality, and delivery",
        type: "ai",
      },
      {
        module: "Procurement",
        step: "Issue purchase order to selected vendor with agreed terms, delivery schedule, and payment terms",
        type: "system",
      },
      {
        module: "Warehouse Management",
        step: "Receive goods at warehouse or vessel, inspect quality, and record goods receipt note",
        type: "human",
      },
      {
        module: "Accounts Payable",
        step: "Receive vendor invoice and perform three-way match against PO and goods receipt",
        type: "ai",
      },
      {
        module: "Accounts Payable",
        step: "Route matched invoice through approval workflow based on amount and department thresholds",
        type: "system",
      },
      {
        module: "Treasury",
        step: "Schedule payment in next payment run based on vendor terms and cash flow forecast",
        type: "system",
      },
      {
        module: "Accounts Payable",
        step: "Execute payment via bank transfer and send remittance advice to vendor",
        type: "system",
      },
    ],
    participatingModules: [
      "Procurement",
      "Warehouse Management",
      "Accounts Payable",
      "Treasury",
    ],
    aiAgents: [
      "Vendor Selection Agent",
      "Invoice Matching Agent",
      "Payment Optimization Agent",
    ],
    handoffPoints: [
      "Requisition approved triggers vendor sourcing",
      "PO issued triggers goods delivery tracking",
      "Goods received triggers invoice matching",
      "Invoice approved triggers payment scheduling",
      "Payment executed triggers vendor notification",
    ],
    typicalTimeline: "7-45 days from requisition to payment",
    kpis: [
      "Purchase order cycle time",
      "Three-way match rate (auto-matched %)",
      "Invoice processing cost per invoice",
      "Vendor payment on-time rate",
      "Procurement savings vs budget",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-16: Customer Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-16",
    name: "Customer Lifecycle",
    description:
      "End-to-end customer relationship management from initial lead capture and qualification through onboarding, ongoing service delivery, and retention strategies to maximize customer lifetime value.",
    steps: [
      {
        module: "CRM",
        step: "Capture new lead from trade show, website inquiry, or market intelligence referral",
        type: "human",
      },
      {
        module: "CRM",
        step: "Qualify lead by analyzing shipping volumes, trade lanes, credit profile, and strategic fit",
        type: "ai",
      },
      {
        module: "CRM",
        step: "Conduct commercial meeting, present service capabilities, and negotiate contract terms",
        type: "human",
      },
      {
        module: "Customer Onboarding",
        step: "Execute KYC/AML checks, set up customer master data, and configure credit limit",
        type: "system",
      },
      {
        module: "Credit Management",
        step: "Assess credit risk and assign credit terms based on financial statements and trade references",
        type: "ai",
      },
      {
        module: "Quotation Management",
        step: "Issue contract rates for agreed trade lanes with volume commitment and validity period",
        type: "system",
      },
      {
        module: "Customer Service",
        step: "Provide ongoing shipment visibility, proactive exception alerts, and dedicated support",
        type: "ai",
      },
      {
        module: "CRM",
        step: "Monitor customer health score and trigger retention actions for at-risk accounts",
        type: "ai",
      },
    ],
    participatingModules: [
      "CRM",
      "Customer Onboarding",
      "Credit Management",
      "Quotation Management",
      "Customer Service",
    ],
    aiAgents: [
      "Lead Scoring Agent",
      "Credit Assessment Agent",
      "Customer Health Agent",
      "Rate Optimizer Agent",
    ],
    handoffPoints: [
      "Lead qualified triggers commercial engagement",
      "Terms agreed triggers KYC onboarding",
      "KYC approved triggers credit assessment",
      "Credit approved triggers rate contract setup",
      "Health score drops triggers retention workflow",
    ],
    typicalTimeline: "14-60 days for onboarding; ongoing for retention",
    kpis: [
      "Lead-to-customer conversion rate",
      "Customer onboarding time (days)",
      "Customer lifetime value (CLV)",
      "Net Promoter Score (NPS)",
      "Customer churn rate",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-17: Vessel Dry Dock
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-17",
    name: "Vessel Dry Dock",
    description:
      "Vessel dry docking lifecycle from maintenance planning and budget approval through shipyard execution, class survey and inspections, and return to operational service with renewed certificates.",
    steps: [
      {
        module: "Vessel Maintenance",
        step: "Plan dry dock scope based on class survey requirements, condition reports, and PMS data",
        type: "ai",
      },
      {
        module: "Procurement",
        step: "Tender dry dock specification to qualified shipyards and evaluate bids for cost and timeline",
        type: "human",
      },
      {
        module: "Vessel Maintenance",
        step: "Prepare detailed work list with budget allocation and management approval for capex items",
        type: "human",
      },
      {
        module: "Schedule & Voyage Planning",
        step: "Schedule vessel off-hire window with minimum commercial disruption to service rotation",
        type: "ai",
      },
      {
        module: "Vessel Maintenance",
        step: "Execute dry dock repairs, hull treatment, machinery overhaul, and class renewal works",
        type: "human",
      },
      {
        module: "Vessel Maintenance",
        step: "Conduct progress inspections and manage additional work items discovered during dock",
        type: "human",
      },
      {
        module: "Compliance",
        step: "Complete class survey, flag state inspection, and renew statutory certificates (SOLAS, MARPOL)",
        type: "system",
      },
      {
        module: "Vessel Operations",
        step: "Return vessel to service with sea trial verification and updated maintenance records",
        type: "system",
      },
      {
        module: "Voyage Accounting",
        step: "Reconcile dry dock costs against budget with variance analysis by work category",
        type: "ai",
      },
    ],
    participatingModules: [
      "Vessel Maintenance",
      "Procurement",
      "Schedule & Voyage Planning",
      "Compliance",
      "Vessel Operations",
      "Voyage Accounting",
    ],
    aiAgents: [
      "Maintenance Planner Agent",
      "Budget Forecast Agent",
      "Schedule Optimizer Agent",
    ],
    handoffPoints: [
      "Scope finalized triggers shipyard tendering",
      "Shipyard selected triggers schedule planning",
      "Vessel arrives at yard triggers work execution",
      "Works complete triggers class survey",
      "Certificates renewed triggers return to service",
    ],
    typicalTimeline: "14-30 days in dry dock; 3-6 months planning ahead",
    kpis: [
      "Dry dock cost variance vs budget",
      "Dry dock duration vs plan (days)",
      "Additional work items as % of original scope",
      "Certificate renewal completion rate",
      "Post-dock deficiency rate",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-18: Trade Route Launch
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-18",
    name: "Trade Route Launch",
    description:
      "New trade route or service loop launch from market demand analysis and commercial feasibility through fleet deployment, pricing strategy, sales activation, and operational launch.",
    steps: [
      {
        module: "Market Intelligence",
        step: "Analyze trade lane demand, competitor capacity, and cargo growth forecasts for target route",
        type: "ai",
      },
      {
        module: "Commercial Planning",
        step: "Build business case with revenue projections, cost model, and breakeven analysis",
        type: "ai",
      },
      {
        module: "Fleet Management",
        step: "Select and deploy vessels to new rotation based on capacity, speed, and fuel efficiency",
        type: "human",
      },
      {
        module: "Schedule & Voyage Planning",
        step: "Design port rotation, transit times, and publish sailing schedule for new service",
        type: "ai",
      },
      {
        module: "Quotation Management",
        step: "Set launch pricing strategy with introductory rates and volume incentives",
        type: "ai",
      },
      {
        module: "CRM",
        step: "Execute sales campaign targeting shippers on the trade lane with service advantages",
        type: "human",
      },
      {
        module: "Port Agency",
        step: "Establish agency agreements and terminal contracts at each port in the rotation",
        type: "human",
      },
      {
        module: "Vessel Operations",
        step: "Commence inaugural voyage with enhanced monitoring and customer visibility",
        type: "system",
      },
      {
        module: "Financial Reporting",
        step: "Track service performance against business case with weekly P&L reviews during ramp-up",
        type: "ai",
      },
    ],
    participatingModules: [
      "Market Intelligence",
      "Commercial Planning",
      "Fleet Management",
      "Schedule & Voyage Planning",
      "Quotation Management",
      "CRM",
      "Port Agency",
      "Vessel Operations",
      "Financial Reporting",
    ],
    aiAgents: [
      "Market Analysis Agent",
      "Revenue Forecast Agent",
      "Voyage Optimizer Agent",
      "Rate Optimizer Agent",
    ],
    handoffPoints: [
      "Business case approved triggers fleet deployment",
      "Fleet assigned triggers schedule design",
      "Schedule published triggers pricing setup",
      "Pricing set triggers sales activation",
      "Agency contracts signed triggers operational launch",
    ],
    typicalTimeline: "3-6 months from analysis to inaugural sailing",
    kpis: [
      "Load factor during ramp-up period",
      "Revenue per TEU vs business case target",
      "Time to breakeven (months)",
      "Customer acquisition on new route",
      "Schedule reliability during launch phase",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-19: ESG Reporting Cycle
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-19",
    name: "ESG Reporting Cycle",
    description:
      "Environmental, Social, and Governance reporting cycle from emissions monitoring and data collection through CII/EEXI calculations, regulatory reporting, third-party audit, and public disclosure.",
    steps: [
      {
        module: "Emissions Monitoring",
        step: "Collect fuel consumption, distance traveled, and cargo carried data from vessel noon reports",
        type: "system",
      },
      {
        module: "Emissions Monitoring",
        step: "Calculate CO2 emissions, CII rating, and EEXI compliance per IMO DCS requirements",
        type: "ai",
      },
      {
        module: "ESG Management",
        step: "Monitor vessel CII trajectory and recommend operational measures for D/E rated vessels",
        type: "ai",
      },
      {
        module: "ESG Management",
        step: "Compile Scope 1, 2, and 3 emissions inventory across fleet and shore operations",
        type: "system",
      },
      {
        module: "Compliance",
        step: "Prepare EU MRV, IMO DCS, and FuelEU Maritime regulatory submissions",
        type: "system",
      },
      {
        module: "ESG Management",
        step: "Generate sustainability report aligned with GRI, TCFD, and Poseidon Principles frameworks",
        type: "ai",
      },
      {
        module: "ESG Management",
        step: "Submit report for third-party verification and address auditor findings",
        type: "human",
      },
      {
        module: "ESG Management",
        step: "Publish verified ESG report and update ratings agencies, investors, and customers",
        type: "human",
      },
    ],
    participatingModules: [
      "Emissions Monitoring",
      "ESG Management",
      "Compliance",
    ],
    aiAgents: [
      "Emissions Calculator Agent",
      "CII Trajectory Agent",
      "ESG Report Generator Agent",
    ],
    handoffPoints: [
      "Data collected triggers emissions calculation",
      "CII calculated triggers corrective action planning",
      "Emissions inventory triggers regulatory filing",
      "Report drafted triggers third-party audit",
      "Audit cleared triggers public disclosure",
    ],
    typicalTimeline: "Continuous monitoring; annual reporting cycle",
    kpis: [
      "Fleet average CII rating",
      "Year-over-year CO2 reduction (%)",
      "EU ETS compliance cost",
      "ESG audit non-conformity count",
      "Poseidon Principles alignment score",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // E2E-20: Empty Repositioning
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "E2E-20",
    name: "Empty Repositioning",
    description:
      "Empty container repositioning lifecycle from demand-supply imbalance forecasting through route optimization, execution of repositioning moves, tracking, and cost reconciliation against budget.",
    steps: [
      {
        module: "Equipment Management",
        step: "Forecast container demand and supply imbalance by location, size, and type for coming weeks",
        type: "ai",
      },
      {
        module: "Equipment Management",
        step: "Identify surplus and deficit locations across the network with stock level analysis",
        type: "system",
      },
      {
        module: "Equipment Management",
        step: "Optimize repositioning routes considering vessel space, inland cost, and street turn opportunities",
        type: "ai",
      },
      {
        module: "Booking Management",
        step: "Book empty containers on vessels or inland transport with lowest cost repositioning option",
        type: "system",
      },
      {
        module: "Vessel Operations",
        step: "Load empty containers on designated vessel with priority below laden cargo",
        type: "system",
      },
      {
        module: "Container Tracking",
        step: "Track empty container movements with milestone updates from origin to deficit location",
        type: "ai",
      },
      {
        module: "Equipment Management",
        step: "Receive and inspect repositioned empties at destination depot; update available inventory",
        type: "human",
      },
      {
        module: "Cost Accounting",
        step: "Reconcile repositioning costs against budget and allocate to trade lanes causing the imbalance",
        type: "ai",
      },
    ],
    participatingModules: [
      "Equipment Management",
      "Booking Management",
      "Vessel Operations",
      "Container Tracking",
      "Cost Accounting",
    ],
    aiAgents: [
      "Demand Forecast Agent",
      "Repositioning Optimizer Agent",
      "Container Tracking Agent",
      "Cost Allocation Agent",
    ],
    handoffPoints: [
      "Imbalance forecast triggers repositioning planning",
      "Routes optimized triggers booking of empty moves",
      "Empties booked triggers vessel loading",
      "Empties arrived triggers depot inventory update",
      "Repositioning complete triggers cost reconciliation",
    ],
    typicalTimeline: "7-30 days per repositioning cycle",
    kpis: [
      "Repositioning cost per TEU",
      "Empty-to-laden ratio",
      "Forecast accuracy for container demand",
      "Street turn rate (reuse without repo)",
      "Days of empty stock at deficit locations",
    ],
  },
];
