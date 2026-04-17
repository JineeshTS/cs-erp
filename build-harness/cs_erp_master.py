#!/usr/bin/env python3
"""
CS ERP Master Automation Script v2 — Quality-Enforced
- Validates every JSON before seeding: IDs, names, req counts, descriptions
- Auto-normalizes field names and ID formats
- Rejects & retries malformed parts
- Tracks exact part-level state in /root/cs_erp_state.json
Usage: nohup python3 /root/cs_erp_master.py > /tmp/cs_erp_master.log 2>&1 &
"""
import subprocess, json, sys, os, time, logging, re, shutil

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('/tmp/cs_erp_master.log'),
        logging.StreamHandler()
    ]
)
log = logging.getLogger('cs-erp')

STATE_FILE = '/root/cs_erp_state.json'

# ─── FULL MODULE LIST ─────────────────────────────────────────────────────────
MODULES = [
    {"id":"MOD-001","name":"Core AI Architecture & Agent Framework","port":4001,"parts":[
        {"part":1,"features":"Multi-Agent Orchestration Engine, Document Intelligence Agent, AI Workflow Orchestration Agent, Human-in-Loop Escalation Engine"},
        {"part":2,"features":"AI Model Router, Agent Performance Monitoring, Agent Training & Feedback Loop, Natural Language Query Interface"},
        {"part":3,"features":"Exception Detection & Classification, AI Communication Agent, Sanctions & Compliance Screening"},
    ]},
    {"id":"MOD-002","name":"Infrastructure & Security Foundation","port":4002,"parts":[
        {"part":1,"features":"Cloud Native Deployment, Identity & Access Management, Data Encryption & Key Management, Audit Trail & Compliance Logging"},
        {"part":2,"features":"API Gateway & Service Mesh, Disaster Recovery & Business Continuity, Monitoring Alerting & Observability, Data Residency & Sovereignty"},
        {"part":3,"features":"Network Security & Zero Trust Architecture, Backup & Data Protection"},
    ]},
    {"id":"MOD-003","name":"Multi-Entity & Legal Structure","port":4003,"parts":[
        {"part":1,"features":"Legal Entity Management, Multi-Currency & FX Management, Regional Tax Compliance, Intercompany Transaction Management"},
        {"part":2,"features":"Intercompany Settlement & Netting Engine, Oracle Fusion Integration for Consolidation, Regional Regulatory Compliance, Multi-Language & Localization"},
    ]},
    {"id":"MOD-004","name":"Integration & EDI Layer","port":4004,"parts":[
        {"part":1,"features":"Oracle Fusion Financial Integration, EDI Processing Engine, DPW PortConnect Integration, Customs Authority Integration"},
        {"part":2,"features":"Shipping Line API Integrations, Port Community System Integration, Freight Forwarder & Agent Integration, Bank & Payment Gateway Integration"},
    ]},
    {"id":"MOD-005","name":"Sales & CRM","port":4005,"parts":[
        {"part":1,"features":"Customer Master & Segmentation, Opportunity & Pipeline Management, Rate Quotation Management, Contract Management"},
        {"part":2,"features":"Account Management & Retention, Sales Performance & Incentives, Customer Onboarding, Lead Management & Marketing"},
    ]},
    {"id":"MOD-006","name":"Customer Self-Service Portal","port":4006,"parts":[
        {"part":1,"features":"Online Booking & Booking Management, Shipment Tracking & Visibility, Document Management Portal, Freight Invoice & Payment Portal"},
        {"part":2,"features":"Rate Request & Inquiry Portal, Container Availability Check, Complaint & Dispute Management, Notification Preferences & Alerts"},
    ]},
    {"id":"MOD-007","name":"Commercial & Pricing Management","port":4007,"parts":[
        {"part":1,"features":"Tariff Management, Special Rates & Rate Agreements, Surcharge Management, Detention & Demurrage Tariffs"},
        {"part":2,"features":"Yield Management & Revenue Optimization, Rate Benchmarking & Market Intelligence, Profitability Analysis per Trade Lane, AI Dynamic Pricing Engine"},
        {"part":3,"features":"VSA Slot Rate Management, Dead Freight Calculation & Recovery, Revenue Leakage Detection, Pricing Approval Workflows"},
    ]},
    {"id":"MOD-008","name":"Customer Service Operations","port":4008,"parts":[
        {"part":1,"features":"COC Export Booking Management, COC Import Coordination, SOC Container Management, Pre-Alert Processing & Distribution"},
        {"part":2,"features":"Shipping Instructions Management, Bill of Lading Draft & Approval, SI Amendment Management, Customer Case Management"},
        {"part":3,"features":"Delivery Order Management, Container Release Management, Port Pass Coordination, Customer Query Resolution AI"},
    ]},
    {"id":"MOD-009","name":"Operations & Documentation Management","port":4009,"parts":[
        {"part":1,"features":"Bill of Lading Management, Manifest Preparation & Submission, AMS ISF ICS2 Regulatory Filing, VGM Verified Gross Mass Management"},
        {"part":2,"features":"Cargo Insurance Management, Customs Document Management, Certificate of Origin Processing, Phytosanitary & Health Certificate"},
        {"part":3,"features":"Dangerous Goods IMDG Documentation, Temperature Controlled Cargo Documentation, Out of Gauge Cargo Documentation, Document Archival & Retrieval"},
    ]},
    {"id":"MOD-010","name":"Equipment Control & Yard Management","port":4010,"parts":[
        {"part":1,"features":"Container Fleet Management & Tracking, Container Repositioning Planning, Reefer Container Management, Container Maintenance & Repair MNR"},
        {"part":2,"features":"Yard Planning & Slot Allocation, Gate In Out CODECO Management, Equipment Interchange Management, On-Hire Off-Hire Container Management"},
        {"part":3,"features":"Container Survey & Inspection Management, Leased Container Portfolio Management, Container Availability Planning AI, AI Empty Repositioning Optimizer"},
    ]},
    {"id":"MOD-011","name":"Capacity & Voyage Management","port":4011,"parts":[
        {"part":1,"features":"Vessel Schedule Management, Port Rotation & Call Management, Capacity Allocation by Trade, Space Management & Booking Control"},
        {"part":2,"features":"Transshipment Planning & Coordination, Loading List & Cut-Off Management, BAPLIE Bay Plan Management, Stowage Planning & Optimization"},
        {"part":3,"features":"AI Load Optimization Engine, Revenue per TEU Analytics, Capacity Forecasting & Demand Planning, Schedule Reliability & Performance Tracking"},
    ]},
    {"id":"MOD-012","name":"Chartering & Vessel Management","port":4012,"parts":[
        {"part":1,"features":"Charter Party Management, Voyage Estimation & Proforma, Hire Statement Calculation, Laytime Calculation & Despatch Demurrage"},
        {"part":2,"features":"Vessel Performance Monitoring, Off-Hire Management & Claims, TDR Preparation & Distribution, Voyage Profit & Loss Statement"},
        {"part":3,"features":"COA Contract of Affreightment Management, TC-In & TC-Out Management, Vessel Fixture & Negotiation Register, AI Vessel Utilization Optimizer"},
    ]},
    {"id":"MOD-013","name":"Bunker & Fuel Management","port":4013,"parts":[
        {"part":1,"features":"Bunker Procurement & Ordering, Bunker Stem & Supply Planning, Bunker Quality Management & Claims, Fuel ROB Tracking & Reconciliation"},
        {"part":2,"features":"EEXI CII Emissions Compliance, Low Sulphur Fuel Management 0.5%, Bunker Cost Allocation per Voyage, AI Bunker Optimization Engine"},
    ]},
    {"id":"MOD-014","name":"Costing & Financial Management","port":4014,"parts":[
        {"part":1,"features":"Voyage Costing & Budgeting, Port Disbursement Accounting PDA FDA, Freight Revenue Recognition IFRS15, Agency Commission Accounting"},
        {"part":2,"features":"Voyage Profit & Loss per Service, Container Cost Tracking & Allocation, Overhead & Shared Cost Allocation, Budget vs Actual Variance Analysis"},
        {"part":3,"features":"Cost Centre Management, CAPEX Tracking & Amortization, AI Cost Anomaly Detection, Management Reporting & KPI Dashboard"},
    ]},
    {"id":"MOD-015","name":"Freight Invoice & Revenue Management","port":4015,"parts":[
        {"part":1,"features":"Freight Invoice Generation & Dispatch, Debit Note & Credit Note Management, Invoice Amendment & Reissue, Proforma Invoice Management"},
        {"part":2,"features":"Revenue Accrual & Deferral IFRS, Invoice Dispute Resolution Workflow, AI Collection Follow-Up & Dunning, Revenue Forecasting & Pipeline"},
    ]},
    {"id":"MOD-016","name":"Accounts Receivable & Credit Control","port":4016,"parts":[
        {"part":1,"features":"Customer Account Maintenance, Credit Limit & Risk Management, Aging Analysis & Reporting, Cash Application & Allocation"},
        {"part":2,"features":"Collection Workflow & Escalation, Bad Debt Provisioning & Write-Off, AI Payment Prediction & Scoring, Cash Flow Forecasting Dashboard"},
    ]},
    {"id":"MOD-017","name":"Accounts Payable & Vendor Management","port":4017,"parts":[
        {"part":1,"features":"Vendor Master & Onboarding Management, Purchase Order Management, Vendor Invoice Processing & Matching, 3-Way Match Automation"},
        {"part":2,"features":"Payment Processing & Scheduling, Vendor Account Reconciliation, AI Invoice Data Extraction OCR, Spend Analytics & Reporting"},
    ]},
    {"id":"MOD-018","name":"Port Disbursement Accounting","port":4018,"parts":[
        {"part":1,"features":"Proforma DA Estimation, Final DA Reconciliation & Approval, Port Cost Management & Tracking, Port Agent Statement of Account"},
        {"part":2,"features":"Port Expense Allocation per Voyage, PDA vs FDA Variance Analysis, AI Port Cost Benchmarking, Multi-Port Consolidated Reporting"},
    ]},
    {"id":"MOD-019","name":"Vessel Technical Management","port":4019,"parts":[
        {"part":1,"features":"Planned Maintenance System PMS, Dry Dock Planning & Management, Classification & Flag State Survey Tracking, Defect & Repair Management"},
        {"part":2,"features":"Spare Parts Inventory & Ordering, Technical Procurement & Approval, SOLAS ISM SMS Compliance, AI Predictive Maintenance Engine"},
    ]},
    {"id":"MOD-020","name":"Crew Management","port":4020,"parts":[
        {"part":1,"features":"Crew Planning & Rotation Management, Certificate & Competency Tracking STCW, Crew Payroll & Allotment Processing, Flag State & Port State Compliance"},
        {"part":2,"features":"Manning Agency Management, Visa Travel & Repatriation Management, Crew Welfare & Medical Management, MLC 2006 Compliance Tracking"},
    ]},
    {"id":"MOD-021","name":"Liner Trade Route Management","port":4021,"parts":[
        {"part":1,"features":"Service Loop & String Management, Port Pair Trade Lane Analysis, Trade Lane P&L Performance, Slot Agreement VSA Management"},
        {"part":2,"features":"Alliance Management & Coordination, Port Stay & Productivity Analysis, AI Route Optimization Engine, Market Intelligence & Rate Index Integration"},
    ]},
    {"id":"MOD-022","name":"Demurrage & Detention Management","port":4022,"parts":[
        {"part":1,"features":"Demurrage Calculation Engine, Free Time & Grace Period Management, Detention Tracking per Container, D&D Invoice Generation & Dispatch"},
        {"part":2,"features":"D&D Dispute Resolution Workflow, Waiver & Concession Management, AI D&D Early Warning & Prediction, Customer Automated Notifications"},
    ]},
    {"id":"MOD-023","name":"Dangerous Goods Management","port":4023,"parts":[
        {"part":1,"features":"IMDG Code Compliance Engine, DG Cargo Booking Acceptance Screening, Segregation Rules & Stowage Requirements, Placard & Label Requirements"},
        {"part":2,"features":"DG Manifest Preparation & Submission, Emergency Response Procedures MFAG, Chemical Safety Data Management, DG Incident Reporting & Investigation"},
    ]},
    {"id":"MOD-024","name":"Reefer Container Management","port":4024,"parts":[
        {"part":1,"features":"Reefer Cargo Booking & Acceptance, Temperature & Humidity IoT Monitoring, Pre-Trip Inspection PTI Management, Reefer Plug & Power Management"},
        {"part":2,"features":"Cold Chain Documentation & Compliance, Reefer Breakdown & Emergency Response, Temperature Exceedance Alerts & Escalation, Cargo Claim Prevention Analytics"},
    ]},
    {"id":"MOD-025","name":"OOG & Special Cargo Management","port":4025,"parts":[
        {"part":1,"features":"OOG Cargo Acceptance & Measurement Validation, Stowage Planning for Flat Rack & Open Top, Special Equipment Management, Cargo Securing Plan Generation"},
        {"part":2,"features":"Heavy Lift & Project Cargo Coordination, Multi-Modal OOG Logistics, OOG Documentation & Permits, Port Authority Approval Management"},
    ]},
    {"id":"MOD-026","name":"Intermodal & ICD Operations","port":4026,"parts":[
        {"part":1,"features":"ICD & Dry Port Management Jebel Ali, Rail Wagon & Train Planning, Truck Booking & Transport Management, Customs Bonded Warehouse Operations"},
        {"part":2,"features":"Last Mile Delivery Management, Multimodal Bill of Lading, Inland Haulage Rate Management, AI Intermodal Route Optimization"},
    ]},
    {"id":"MOD-027","name":"Customs Compliance & Regulatory","port":4027,"parts":[
        {"part":1,"features":"Import Customs Clearance Management, Export Customs Filing & Submission, Transit & Re-Export Procedures, Customs Duty & Tax Calculation"},
        {"part":2,"features":"AEO Authorized Economic Operator Compliance, ISPS Maritime Security Compliance, Port State Control PSC Preparation, IMO Circular & Regulation Tracking"},
    ]},
    {"id":"MOD-028","name":"Survey & Inspection Management","port":4028,"parts":[
        {"part":1,"features":"Pre-Load Cargo Survey Management, Container Condition Survey & MNR, Draft Survey Coordination & Calculation, On-Hire & Off-Hire Survey Management"},
        {"part":2,"features":"Hatch & Hold Inspection Management, Reefer PTI Survey Coordination, Classification Society Interface, Survey Report Management & Archive"},
    ]},
    {"id":"MOD-029","name":"Insurance & Claims Management","port":4029,"parts":[
        {"part":1,"features":"P&I Club Policy & Correspondence Management, Hull & Machinery Insurance Management, Cargo Insurance Policy Management, Survey Appointment & Coordination"},
        {"part":2,"features":"Claims Registration & Investigation, Claims Recovery & Subrogation Management, AI Claims Prediction & Prevention, Loss Prevention Analytics & Reporting"},
    ]},
    {"id":"MOD-030","name":"Port Agency Management","port":4030,"parts":[
        {"part":1,"features":"Port Call Planning & Coordination, Husbandry & Crew Services, Pre-Arrival Checklist & Notifications, Port Authority Communications Management"},
        {"part":2,"features":"Crew Change Coordination & Logistics, Cash to Master & Petty Cash, Vessel Clearance Inward & Outward, Disbursement Account Management"},
    ]},
    {"id":"MOD-031","name":"Analytics & Business Intelligence","port":4031,"parts":[
        {"part":1,"features":"Executive KPI Dashboard TEU Revenue GP Utilization, Voyage & Service Analytics, Trade Lane Performance Analytics, Customer Revenue Analytics"},
        {"part":2,"features":"Predictive Analytics & Forecasting AI, Market Intelligence & Competitor Benchmarking, Operational Efficiency Analytics, Automated BI Report Generation"},
    ]},
    {"id":"MOD-032","name":"Master Data Management","port":4032,"parts":[
        {"part":1,"features":"Port & Terminal Master Data, Vessel Registry & Particulars, Commodity & HS Code Master, Container Type & ISO Code Master"},
        {"part":2,"features":"Customer & Agent Hierarchy Management, Freight Tariff Code Master, Live Exchange Rate Feed Management, GL Account & Cost Centre Master"},
    ]},
    {"id":"MOD-033","name":"Workflow & Notification Engine","port":4033,"parts":[
        {"part":1,"features":"Approval Workflow Builder & Management, SLA Definition & Tracking, Delegation of Authority DOA Matrix, Auto-Assignment & Routing Rules"},
        {"part":2,"features":"Email Notification Template Engine, WhatsApp Business Alerts Integration, SMS Gateway Notifications, In-App Notification Centre"},
    ]},
    {"id":"MOD-034","name":"Document Management System","port":4034,"parts":[
        {"part":1,"features":"Document Repository & Classification, Version Control & Document History, Digital Signature & e-Stamping, Document Template Library"},
        {"part":2,"features":"OCR Auto-Indexing & Data Extraction, Document Expiry & Renewal Alerts, Archive & Retention Management, AI Document Search & Retrieval"},
    ]},
    {"id":"MOD-035","name":"Audit & Compliance Management","port":4035,"parts":[
        {"part":1,"features":"Internal Audit Planning & Management, Regulatory Compliance Calendar, Risk Register & Risk Assessment, Policy & Procedure Management"},
        {"part":2,"features":"Regulatory Reporting & Submissions, SOX & Financial Controls Compliance, ISO Certification Tracking & Renewal, AI Risk Detection & Scoring"},
    ]},
    {"id":"MOD-036","name":"Admin Portal","port":4036,"parts":[
        {"part":1,"features":"User & Role Management RBAC, Module & Feature Configuration, AI Agent Configuration 95-5 Tuning, Approval Matrix & DOA Administration"},
        {"part":2,"features":"Integration Endpoint Management, Master Data Administration Tools, Audit Log Viewer & Search, System Health & Performance Dashboard"},
        {"part":3,"features":"Feature Flag Management, License & Subscription Management, Bulk Data Import & Export Tools, Notification Template Administration"},
    ]},
    {"id":"MOD-037","name":"HR & Payroll Shore Staff","port":4037,"parts":[
        {"part":1,"features":"Employee Master & Profile Management, Leave & Absence Management, Attendance & Time Tracking, Performance Appraisal Management"},
        {"part":2,"features":"Payroll Processing WPS Compliance, GOSI PIFSS EPF Social Insurance, End of Service Gratuity Calculation, Visa & Residency Lifecycle Management"},
    ]},
    {"id":"MOD-038","name":"Procurement & Supply Chain","port":4038,"parts":[
        {"part":1,"features":"Purchase Requisition Management, Vendor Sourcing & RFQ Process, Purchase Order Lifecycle Management, Procurement Contract Management"},
        {"part":2,"features":"Inventory Management & Stock Control, Goods Receipt & Quality Inspection, AI Spend Analytics & Optimization, Supplier Performance Scorecard"},
    ]},
    {"id":"MOD-039","name":"Fixed Assets Management","port":4039,"parts":[
        {"part":1,"features":"Asset Registry Containers Vessels Equipment, Depreciation Schedule Management, Asset Disposal & Write-Off, Asset Insurance & Valuation Tracking"},
        {"part":2,"features":"Asset Maintenance Schedule Integration, CAPEX vs OPEX Classification, Asset Impairment Testing IFRS, IFRS16 Lease Accounting ROU Assets"},
    ]},
    {"id":"MOD-040","name":"Treasury & Cash Management","port":4040,"parts":[
        {"part":1,"features":"Bank Account Portfolio Management, Daily Cash Position Dashboard, Bank Reconciliation Automation, Cash Pooling & Sweeping"},
        {"part":2,"features":"FX Hedging & Exposure Management, Letter of Credit LC Management, Bank Guarantee BG Management, Intercompany Loan Management"},
    ]},
    {"id":"MOD-041","name":"General Ledger & Financial Reporting","port":4041,"parts":[
        {"part":1,"features":"Chart of Accounts Management, Journal Entry & Posting Management, Period Close Procedures Automation, IFRS Financial Statements Generation"},
        {"part":2,"features":"Segment Reporting by Entity & Trade Lane, Consolidated Financial Statements, Budget Planning & Management, Variance Analysis & Commentary"},
    ]},
    {"id":"MOD-042","name":"Vessel Performance & Efficiency","port":4042,"parts":[
        {"part":1,"features":"Speed Consumption & Performance Monitoring, CII Carbon Intensity Rating Calculation, EEXI Energy Efficiency Compliance, Noon Report Processing & Analysis"},
        {"part":2,"features":"Voyage Performance vs Charter Party Analysis, AI Weather Routing Integration, IMO 2050 Carbon Emissions Tracking, Fuel Efficiency Benchmarking & Reporting"},
    ]},
    {"id":"MOD-043","name":"Cargo Claims Management","port":4043,"parts":[
        {"part":1,"features":"Cargo Claim Registration & Triage, Liability Assessment Hague-Visby Rules, Cargo Damage Survey & Documentation, Time Bar Tracking & Alerts"},
        {"part":2,"features":"Claim Settlement & Payment Processing, Subrogation & Recovery Management, AI Claim Probability Prediction, Claims Portfolio Analytics"},
    ]},
    {"id":"MOD-044","name":"Container Leasing Management","port":4044,"parts":[
        {"part":1,"features":"Lease Agreement Lifecycle Management, On-Hire Off-Hire Event Tracking, MNR Damage Billing to Lessor, Lease Cost Allocation per Trade"},
        {"part":2,"features":"Lessor Statement Reconciliation, Container Return & Redelivery Management, Lease vs Buy Financial Analysis, AI Fleet Composition Optimizer"},
    ]},
    {"id":"MOD-045","name":"Port Tariff & Terminal Billing","port":4045,"parts":[
        {"part":1,"features":"Terminal Handling Charge THC Management, Port Dues & Wharfage Calculation, Pilotage Towage & Mooring Charges, Storage & Demurrage Tariff"},
        {"part":2,"features":"Port Tariff Comparison & Benchmarking, Terminal Invoice Validation & Dispute, AI Port Cost Optimization Recommendations, Port Budget Planning & Control"},
    ]},
    {"id":"MOD-046","name":"Liner Operations Control","port":4046,"parts":[
        {"part":1,"features":"Cargo Cut-Off Management per Port, Overbooking & Rollover Management, Rolling & Upgrade Management, Revenue Integrity & Rate Audit"},
        {"part":2,"features":"Slot Swap Coordination with Partners, Schedule Deviation & Recovery Management, AI Cargo Mix Optimization, Load Factor & Utilization Reporting"},
    ]},
    {"id":"MOD-047","name":"Agent Network Management","port":4047,"parts":[
        {"part":1,"features":"General Agent GA Agreement Management, Sub-Agent Configuration & Access, Agent Commission Calculation & Payment, Agency Agreement Document Management"},
        {"part":2,"features":"Agent Performance KPI Dashboard, Agent Portal Access & Configuration, Booking Authority Matrix Management, Agent Incentive & Bonus Management"},
    ]},
    {"id":"MOD-048","name":"Sustainability & ESG Reporting","port":4048,"parts":[
        {"part":1,"features":"Carbon Footprint Calculation per Voyage, GHG Protocol Scope 1 2 3 Reporting, Sea Cargo Charter Annual Reporting, POSEIDON Principles Alignment"},
        {"part":2,"features":"Decarbonization Roadmap Tracking, Alternative Fuel & Green Fuel Tracking, ESG KPI Dashboard & Benchmarking, TCFD Sustainability Reporting"},
    ]},
    {"id":"MOD-049","name":"Real-Time IoT & Asset Tracking","port":4049,"parts":[
        {"part":1,"features":"Container GPS Location Tracking, Reefer IoT Temperature Humidity Monitoring, Electronic Seal Integrity Monitoring, Shock Tilt & Vibration Detection"},
        {"part":2,"features":"AIS Vessel Position Tracking, Port Equipment IoT Monitoring, Predictive Alert & Maintenance Engine, IoT Data Lake Analytics Dashboard"},
    ]},
    {"id":"MOD-050","name":"Mobile Operations App","port":4050,"parts":[
        {"part":1,"features":"Gate In & Out Mobile Processing, Yard Inspection Mobile App, Container Survey Mobile App, Offline Sync Capability"},
        {"part":2,"features":"Container Damage Photo Upload & AI Assessment, Driver App & POD Delivery Confirmation, Executive Mobile Dashboard, Push Notification Management"},
    ]},
    {"id":"MOD-051","name":"Liner Revenue Management","port":4051,"parts":[
        {"part":1,"features":"Revenue per TEU Maximization Strategy, Cargo Mix & Portfolio Management, AI Demand Forecasting per Trade Lane, Freight Forward Contracts & Futures"},
        {"part":2,"features":"Revenue Leakage Detection & Prevention, Rate Integrity & Unauthorized Discount Control, Revenue Accrual Management, AI Revenue Maximization Engine"},
    ]},
    {"id":"MOD-052","name":"Schedule & Voyage Planning","port":4052,"parts":[
        {"part":1,"features":"Multi-Service Schedule Integration & Publication, Port Sequence & Berth Window Optimization, Suez Panama Canal Transit Management, ETA ETD Management & Proactive Updates"},
        {"part":2,"features":"AI Voyage Optimization Engine, Speed vs Fuel Trade-Off Analysis, Weather Routing Integration, Long-Term Vessel Deployment Planning"},
    ]},
    {"id":"MOD-053","name":"Transshipment Hub Management","port":4053,"parts":[
        {"part":1,"features":"Transshipment Cargo Planning & Coordination, Feeder Vessel & Connecting Service Coordination, T/S Cargo Tracking Through Hub, Missed Connection & Recovery Management"},
        {"part":2,"features":"T/S Revenue Attribution & Profitability, Hub Efficiency & Productivity Analytics, AI Transshipment Optimization Engine, Long Transshipment Penalty Tracking"},
    ]},
    {"id":"MOD-054","name":"Knowledge Management & Training","port":4054,"parts":[
        {"part":1,"features":"SOP Library & Process Documentation, Training Module Creation & Management, Staff Competency Assessment, Employee Onboarding Workflow Automation"},
        {"part":2,"features":"AI Knowledge Assistant & Search, Regulatory Update Alert Management, Lessons Learned Repository, Video Training Library Management"},
    ]},
    {"id":"MOD-055","name":"Implementation & Change Management","port":4055,"parts":[
        {"part":1,"features":"Project Plan & Milestone Tracking, Data Migration Strategy & Tooling, User Acceptance Testing UAT Management, Go-Live Readiness Checklist"},
        {"part":2,"features":"Change Request Management Workflow, System Configuration Management, User Training Completion Tracking, Post-Go-Live Hypercare Support"},
    ]},
    {"id":"MOD-056","name":"Voyage Results & Settlement","port":4056,"parts":[
        {"part":1,"features":"Voyage Close Procedure & Sign-Off, Time Charter TA Settlement, Voyage P&L Finalization & Approval, Hire Statement Reconciliation & Dispute"},
        {"part":2,"features":"Voyage Result Workflow & Audit, Intercompany Voyage Cost Settlement, AI Voyage Profitability Benchmarking, Historical Voyage Analytics Dashboard"},
    ]},
    {"id":"MOD-057","name":"Fleet Deployment Planning","port":4057,"parts":[
        {"part":1,"features":"Vessel Deployment Decision Matrix, Fleet Utilization & Capacity Planning, Service Network Design & Evaluation, AI Fleet Deployment Optimizer"},
        {"part":2,"features":"Fleet Size & Mix Financial Analysis, Vessel Substitution & Swap Management, Long-Term Deployment Contract Management, Freight Market Intelligence Integration"},
    ]},
    {"id":"MOD-058","name":"Empty Container Repositioning AI","port":4058,"parts":[
        {"part":1,"features":"Empty Container Inventory Visibility, Cross-Trade Repositioning Planning, Repositioning Cost Tracking & Approval, AI Repositioning Route Optimizer"},
        {"part":2,"features":"AI Demand Forecast by Trade Lane, Leasing vs Repositioning Decision Engine, Empty Return Incentive Management, Repositioning P&L Attribution"},
    ]},
    {"id":"MOD-059","name":"MARPOL & Environmental Compliance","port":4059,"parts":[
        {"part":1,"features":"MARPOL Annex I to VI Compliance Tracking, Ballast Water Management BWM Convention, Anti-Fouling System AFS Compliance, Vessel Waste Management MARPOL Annex V"},
        {"part":2,"features":"0.5% Sulphur Fuel Cap Compliance, CII Rating Tracking & Improvement Planning, Sea Cargo Charter Annual Disclosure, Environmental Incident Reporting & Investigation"},
    ]},
    {"id":"MOD-060","name":"Loss Prevention & Risk Management","port":4060,"parts":[
        {"part":1,"features":"Enterprise Risk Register Management, HSSE Health Safety Security Environment, Near-Miss & Unsafe Act Reporting, Incident Investigation & Root Cause Analysis"},
        {"part":2,"features":"P&I Club Risk Scoring AI, Business Continuity Plan Management, Emergency Response Procedure Library, Risk KPI Dashboard & Board Reporting"},
    ]},
]

# ─── STATE MANAGEMENT ─────────────────────────────────────────────────────────
def load_state() -> set:
    if os.path.exists(STATE_FILE):
        try:
            return set(json.load(open(STATE_FILE)))
        except Exception:
            pass
    return set()

def save_state(done: set):
    json.dump(sorted(done), open(STATE_FILE, 'w'), indent=2)

# ─── DB HELPERS ───────────────────────────────────────────────────────────────
def psql(sql: str) -> str:
    r = subprocess.run(
        ["docker","exec","-i","06-build-postgres-1","psql","-U","codilla","-d","codilla","-t","-c", sql],
        capture_output=True, text=True
    )
    return r.stdout.strip()

def get_db_stats() -> str:
    return psql("SELECT (SELECT COUNT(*) FROM cs_erp_modules)||' modules '||(SELECT COUNT(*) FROM cs_erp_features)||' features '||(SELECT COUNT(*) FROM cs_erp_requirements)||' requirements'")

# ─── QUALITY VALIDATION ───────────────────────────────────────────────────────
EXPECTED_ID_PATTERN = re.compile(r'^FEAT-\d{3}-\d-\d{3}$')   # FEAT-007-2-001

def validate_json(jsonfile: str, mod: dict, part: dict) -> tuple[bool, list]:
    """
    Full quality check. Returns (ok, list_of_issues).
    Checks: field names, ID format, req count, description length, duplicate names.
    """
    issues = []
    try:
        data = json.load(open(jsonfile))
    except Exception as e:
        return False, [f"Invalid JSON: {e}"]

    features = data.get('features', [])
    if not features:
        return False, ["No features array found"]

    seen_names = set()
    seen_ids = set()
    part_num = part['part']
    mod_num = mod['id'].replace('MOD-','')  # e.g. "007"

    for i, f in enumerate(features, 1):
        fid   = f.get('id', f.get('feature_id', ''))
        fname = f.get('name', f.get('title', f.get('feature_name', '')))
        fdesc = f.get('description', '')
        acs   = (f.get('acceptance_criteria') or
                 f.get('requirements') or
                 f.get('atomic_requirements') or [])

        # ID format
        expected_id = f"FEAT-{mod_num}-{part_num}-{i:03d}"
        if not fid:
            issues.append(f"Feature {i}: missing id (expected {expected_id})")
        elif not EXPECTED_ID_PATTERN.match(fid):
            issues.append(f"Feature {i}: bad ID format '{fid}' (expected FEAT-NNN-P-NNN)")
        elif fid != expected_id:
            issues.append(f"Feature {i}: ID '{fid}' should be '{expected_id}'")

        # Duplicate IDs within file
        if fid in seen_ids:
            issues.append(f"Feature {i}: duplicate ID '{fid}'")
        seen_ids.add(fid)

        # Name presence
        if not fname:
            issues.append(f"Feature {i} ({fid}): missing name/title")

        # Duplicate names within file
        fname_lower = fname.lower().strip()
        if fname_lower in seen_names:
            issues.append(f"Feature {i}: duplicate name '{fname}'")
        seen_names.add(fname_lower)

        # Description length
        if len(fdesc) < 40:
            issues.append(f"Feature {i} ({fid}): description too short ({len(fdesc)} chars)")

        # Requirement count
        req_count = len(acs)
        if req_count < 12:
            issues.append(f"Feature {i} ({fid}): only {req_count} requirements (need ≥12)")
        elif req_count > 22:
            issues.append(f"Feature {i} ({fid}): {req_count} requirements seems excessive (max 22)")

        # Requirement content quality
        for j, ac in enumerate(acs, 1):
            if isinstance(ac, str):
                if len(ac) < 20:
                    issues.append(f"Feature {i} req {j}: too short ('{ac[:40]}')")
            elif isinstance(ac, dict):
                rtitle = ac.get('title', ac.get('text', ac.get('name', '')))
                rdesc  = ac.get('description', '')
                if len(rtitle) < 5:
                    issues.append(f"Feature {i} req {j}: missing/short title")
                if len(rdesc) < 30:
                    issues.append(f"Feature {i} req {j}: description too short")

    if issues:
        return False, issues
    return True, []

# ─── NORMALIZER ───────────────────────────────────────────────────────────────
def normalize_json(data: dict, mod: dict, part: dict) -> dict:
    """
    Normalize all field names and fix IDs to FEAT-NNN-P-NNN format.
    """
    mod_num   = mod['id'].replace('MOD-','')
    part_num  = part['part']

    # Top-level keys
    for k, v in [('module','id'),('module_id','id'),('module_title','name'),('module_name','name')]:
        if k in data and v not in data:
            data[v] = data.pop(k)

    # Features key
    for k in ['feature_list','feature_groups','sections','items']:
        if k in data and 'features' not in data:
            data['features'] = data.pop(k)

    features = data.get('features', [])
    for i, f in enumerate(features, 1):
        # Normalize ID
        for k in ['feature_id','feat_id']:
            if k in f and 'id' not in f:
                f['id'] = f.pop(k)
        # Force correct ID
        f['id'] = f"FEAT-{mod_num}-{part_num}-{i:03d}"

        # Normalize name
        for k in ['feature_title','feature_name','title']:
            if k in f and 'name' not in f:
                f['name'] = f.pop(k)

        # Normalize requirements
        for k in ['atomic_requirements','requirement_list','criteria','items','acceptance_criteria']:
            if k in f and 'requirements' not in f:
                # Convert acceptance_criteria strings to requirement dicts
                if k == 'acceptance_criteria':
                    acs = f.pop(k)
                    if acs and isinstance(acs[0], str):
                        f['requirements'] = [
                            {"id": f"{f['id']}-R{j:03d}", "title": ac, "description": ac}
                            for j, ac in enumerate(acs, 1)
                        ]
                    elif acs and isinstance(acs[0], dict):
                        for j, r in enumerate(acs, 1):
                            if 'id' not in r:
                                r['id'] = f"{f['id']}-R{j:03d}"
                        f['requirements'] = acs
                else:
                    f['requirements'] = f.pop(k)

        # Normalize requirement IDs
        for j, r in enumerate(f.get('requirements', []), 1):
            if isinstance(r, dict) and not r.get('id'):
                r['id'] = f"{f['id']}-R{j:03d}"

    return data

# ─── CLAUDE CODE RUNNER ───────────────────────────────────────────────────────
def run_claude(prompt: str, outfile: str) -> bool:
    if os.path.exists(outfile):
        os.remove(outfile)
    log.info(f"  Running Claude Code → {outfile}")
    try:
        result = subprocess.run(
            ["su","-","ubuntu","-c", f'claude --dangerously-skip-permissions -p {json.dumps(prompt)}'],
            capture_output=True, text=True, timeout=600
        )
    except subprocess.TimeoutExpired:
        log.error(f"  ❌ Claude Code timed out after 600s")
        return False
    except Exception as e:
        log.error(f"  ❌ Claude Code error: {e}")
        return False
    if os.path.exists(outfile) and os.path.getsize(outfile) > 100:
        log.info(f"  ✅ Written {os.path.getsize(outfile)} bytes")
        return True
    log.error(f"  ❌ Not written. stderr: {result.stderr[:300]}")
    return False

# ─── SEEDER ───────────────────────────────────────────────────────────────────
def seed_file(jsonfile: str) -> bool:
    dest = '/tmp/module_data.json'
    if os.path.exists(dest):
        os.remove(dest)
    shutil.copy(jsonfile, dest)
    os.chmod(dest, 0o666)
    result = subprocess.run(['python3','/root/run_module_seed.py'], capture_output=True, text=True, timeout=120)
    if 'Done:' in result.stdout:
        log.info(f"  ✅ Seeded: {result.stdout.split('Done:')[1].strip()[:100]}")
        return True
    log.error(f"  Seed failed: {result.stderr[:300]}\n{result.stdout[:300]}")
    return False

# ─── PROMPT BUILDER ───────────────────────────────────────────────────────────
def make_prompt(mod: dict, part: dict) -> tuple[str, str]:
    mod_num  = mod['id'].replace('MOD-','')
    part_num = part['part']
    total_p  = len(mod['parts'])
    outfile  = f"/tmp/{mod['id'].replace('-','').lower()}p{part_num}.json"
    feat_count = len(part['features'].split(','))

    prompt = f"""You are a senior container shipping ERP architect.

Write a JSON spec file to: {outfile}
DO NOT write anything else. Only the JSON file.

Context: AI-First Container Shipping ERP for Qatar/Dubai/KSA/India (Hamad Port, Khalifa Port, Jebel Ali, JNPT).
95% AI-automated operations. Multi-entity (Qatar/UAE/KSA/India). Arabic + English. Multi-currency.

Module: {mod['id']} — {mod['name']}
Part: {part_num} of {total_p}
Features in this part: {part['features']}

STRICT JSON FORMAT (no markdown, no comments, pure JSON):
{{
  "id": "{mod['id']}",
  "name": "{mod['name']}",
  "service_name": "{mod['id'].lower().replace('-','')}-service",
  "port": {mod['port']},
  "features": [
    {{
      "id": "FEAT-{mod_num}-{part_num}-001",
      "name": "Exact Feature Name",
      "description": "2-3 sentence description of what this feature does in a container shipping context",
      "requirements": [
        {{
          "id": "FEAT-{mod_num}-{part_num}-001-R001",
          "title": "Short atomic requirement title",
          "description": "Detailed description: what the system must do, the business rule, edge case, or constraint. Minimum 80 words. Include shipping-specific context (port codes, INCOTERMS, container types, regulatory references where relevant)."
        }}
      ]
    }}
  ]
}}

RULES — MUST follow exactly:
1. Feature IDs: FEAT-{mod_num}-{part_num}-001, FEAT-{mod_num}-{part_num}-002, etc.
2. Requirement IDs: FEAT-{mod_num}-{part_num}-001-R001, FEAT-{mod_num}-{part_num}-001-R002, etc.
3. Each feature MUST have EXACTLY 15-18 requirements
4. Each requirement description MUST be ≥80 words, specific, testable, atomic
5. NO duplicate feature names
6. Cover edge cases: multi-currency (USD/AED/QAR/SAR/INR), Arabic RTL UI, Hijri calendar dates, multi-entity, offline scenarios
7. Total features: exactly {feat_count} (one per item in the features list)

After writing the file, confirm with: echo "DONE: {outfile}" && wc -l {outfile}"""

    return prompt, outfile

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    log.info("=" * 60)
    log.info("CS ERP Master Automation v2 — Quality Enforced")
    log.info(f"Total: {len(MODULES)} modules, {sum(len(m['parts']) for m in MODULES)} parts")
    log.info("=" * 60)

    done = load_state()
    log.info(f"Already done: {len(done)} parts")

    total_seeded = 0
    total_failed = 0

    for mod in MODULES:
        for part in mod['parts']:
            key = f"{mod['id']}-P{part['part']}"
            if key in done:
                log.info(f"⏭  Skipping {key}")
                continue

            log.info(f"\n{'─'*50}")
            log.info(f"▶  {key} — {mod['name']} Part {part['part']}")
            log.info(f"   Features: {part['features']}")

            prompt, outfile = make_prompt(mod, part)
            success = False

            for attempt in range(1, 4):
                if attempt > 1:
                    log.warning(f"  🔄 Retry {attempt}/3")
                    time.sleep(15)
                    if os.path.exists(outfile):
                        os.remove(outfile)

                if not run_claude(prompt, outfile):
                    continue

                # Normalize first
                try:
                    raw = json.load(open(outfile))
                    normalized = normalize_json(raw, mod, part)
                    with open(outfile, 'w') as fh:
                        json.dump(normalized, fh, indent=2, ensure_ascii=False)
                    log.info("  ✅ Normalized JSON")
                except Exception as e:
                    log.error(f"  Normalize error: {e}")
                    continue

                # Validate
                ok, issues = validate_json(outfile, mod, part)
                if not ok:
                    log.error(f"  ❌ Validation failed ({len(issues)} issues):")
                    for iss in issues[:10]:
                        log.error(f"     • {iss}")
                    continue

                # Seed
                if seed_file(outfile):
                    success = True
                    total_seeded += 1
                    done.add(key)
                    save_state(done)
                    stats = get_db_stats()
                    log.info(f"  📊 {stats.strip()}")
                    break

            if not success:
                total_failed += 1
                log.error(f"  💀 FAILED after 3 attempts: {key}")

    log.info("\n" + "=" * 60)
    log.info(f"COMPLETE: {total_seeded} seeded, {total_failed} failed")
    log.info(f"Final: {get_db_stats().strip()}")
    log.info("=" * 60)

if __name__ == '__main__':
    main()
