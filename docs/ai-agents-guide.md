# CS-ERP AI Agents Guide

CS-ERP includes 100 AI agents that automate, optimize, and assist across all 61 modules. Agents operate at configurable automation levels and are managed through the AI Agent Framework module.

---

## Agent Architecture

### AI Agent Framework (AAF)

The framework provides:

- **Agent Registry** (`aaf_agents`) -- Configuration for all 100 agents
- **Execution Engine** (`aaf_agent_runs`) -- Tracks each agent invocation with input/output
- **Workflow Orchestration** (`aaf_workflow_definitions`, `aaf_workflow_instances`) -- Multi-step agent pipelines
- **Escalation Management** (`aaf_escalations`) -- Human-in-the-loop escalation handling
- **Document Processing** (`aaf_document_processing_jobs`) -- OCR and document extraction queue

### AI Provider Management

- **Providers** (`ai_providers`) -- Configured AI providers (OpenAI, Anthropic, Google, etc.)
- **Models** (`ai_models`) -- Available models per provider with capability tags
- **Assignments** (`ai_agent_model_assignments`) -- Maps each agent to its assigned model
- **Usage Tracking** (`ai_usage_logs`) -- Token consumption and cost monitoring
- **Failover** -- Automatic fallback between providers on failure or rate limit

---

## Automation Levels

Each agent operates at one of four levels, configurable per tenant:

| Level | Name | Behavior | Human Involvement |
|-------|------|----------|-------------------|
| 1 | **Autonomous** | Executes end-to-end without human input | Results reviewed periodically |
| 2 | **Semi-Autonomous** | Executes but requires human approval at key steps | Approval at decision points |
| 3 | **Assistive** | Provides recommendations for human decision-making | Human makes final decision |
| 4 | **Monitoring** | Continuously watches for anomalies and alerts | Human investigates alerts |

Default level for new tenants is **Semi-Autonomous**.

---

## Complete Agent Directory

### Sales & Commercial Agents (11 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 1 | Lead Scoring Agent | autonomous | Qualifies and prioritizes sales leads based on engagement and fit |
| 2 | Campaign Optimizer Agent | semi_autonomous | Marketing campaign optimization for trade lane promotions |
| 3 | Quote Generator Agent | semi_autonomous | Auto-generates freight quotes from customer inquiries |
| 4 | Rate Optimizer Agent | autonomous | Dynamic pricing and market rate analysis |
| 5 | Contract Compliance Agent | monitoring | Monitors contract terms, volume commitments, and renewals |
| 6 | Customer Churn Predictor | monitoring | Identifies at-risk customers from booking patterns |
| 7 | Customer Revenue Agent | autonomous | Customer profitability and lifetime value calculation |
| 8 | Customer Segmentation Agent | autonomous | Segments customers by behavior, revenue, and trade patterns |
| 9 | Market Intelligence Agent | autonomous | Competitor rate monitoring and market trend analysis |
| 10 | Surcharge Calculator Agent | autonomous | Dynamic BAF, CAF, THC, and special handling surcharges |
| 11 | Trade Lane Analyzer Agent | autonomous | Profitability analysis by trade lane |

### Booking & Documentation Agents (8 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 12 | Booking Validator Agent | autonomous | Validates bookings for space, equipment, and compliance |
| 13 | BL Generator Agent | semi_autonomous | Auto-populates Bill of Lading with compliance checks |
| 14 | Shipping Instruction Agent | autonomous | Processes and validates shipping instructions |
| 15 | Manifest Compiler Agent | autonomous | Compiles and validates cargo manifests |
| 16 | Document Validator Agent | semi_autonomous | OCR-based document validation and classification |
| 17 | Cargo Release Agent | semi_autonomous | Processes delivery orders with hold checks |
| 18 | VGM Validator Agent | autonomous | Verified Gross Mass validation (SOLAS) |
| 19 | Invoice Generator Agent | semi_autonomous | Auto-generates invoices from BL data and tariffs |

### Vessel & Voyage Agents (12 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 20 | Voyage Optimizer Agent | semi_autonomous | Route and speed optimization for fuel efficiency |
| 21 | Voyage P&L Agent | autonomous | Real-time voyage profitability tracking |
| 22 | Voyage Analytics Agent | autonomous | Multi-dimensional voyage performance analysis |
| 23 | ETA Predictor Agent | autonomous | Arrival prediction using AIS, weather, and port data |
| 24 | Speed Optimizer Agent | autonomous | CII-aware speed recommendations |
| 25 | Weather Routing Agent | autonomous | Weather-aware routing with sea state forecasts |
| 26 | Noon Report Analyzer Agent | autonomous | Vessel performance monitoring from noon reports |
| 27 | Fleet Deployment Agent | semi_autonomous | Vessel-to-route assignment optimization |
| 28 | Fleet Utilization Agent | autonomous | Fleet efficiency covering capacity and idle time |
| 29 | Capacity Forecaster Agent | autonomous | Space utilization prediction and overbooking management |
| 30 | Stowage Planner Agent | semi_autonomous | Optimal container placement (weight, DG, reefer) |
| 31 | Charter Party Analyzer Agent | assistive | Charter party term analysis vs market standards |

### Container & Equipment Agents (9 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 32 | Container Allocation Agent | autonomous | Optimal container type/unit selection |
| 33 | Container Damage Assessor | semi_autonomous | Image-based damage classification and repair costing |
| 34 | Empty Repo Optimizer Agent | semi_autonomous | Empty container repositioning optimization |
| 35 | Demurrage Calculator Agent | autonomous | Automated D&D calculation from tariffs and events |
| 36 | Reefer Monitor Agent | autonomous | Temperature anomaly detection for reefer cargo |
| 37 | PTI Scheduler Agent | autonomous | Pre-trip inspection scheduling for reefers |
| 38 | Lease Evaluator Agent | assistive | Container lease vs buy analysis with TCO modeling |
| 39 | GPS Tracker Agent | autonomous | Container/vehicle position monitoring with geofencing |
| 40 | IoT Alert Agent | autonomous | Sensor anomaly detection for container/vessel IoT |

### Port & Terminal Agents (8 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 41 | Berth Allocation Agent | semi_autonomous | Optimal berth planning by vessel size and schedule |
| 42 | Port Call Optimizer Agent | semi_autonomous | Optimize anchorage, berth, and cargo operations |
| 43 | Port Tariff Agent | autonomous | Port tariff calculation and validation |
| 44 | Port Turnaround Optimizer | semi_autonomous | Minimize port stay through optimized sequencing |
| 45 | Disbursement Estimator Agent | autonomous | Proforma Disbursement Account calculation |
| 46 | Transshipment Planner Agent | semi_autonomous | Hub optimization for transshipment routing |
| 47 | Intermodal Planner Agent | semi_autonomous | Multimodal route optimization (sea/road/rail) |
| 48 | Last Mile Optimizer Agent | autonomous | Delivery route optimization for last mile |

### Finance & Accounting Agents (12 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 49 | Cash Application Agent | autonomous | Automatic payment-to-invoice matching |
| 50 | Cash Flow Predictor Agent | autonomous | Working capital forecasting |
| 51 | Revenue Recognition Agent | autonomous | IFRS 15 compliant revenue recognition |
| 52 | Budget Variance Agent | monitoring | Auto-flags budget deviations |
| 53 | Cost Anomaly Agent | monitoring | Detects unusual cost patterns |
| 54 | Fraud Detection Agent | autonomous | Anomalous financial transaction detection |
| 55 | FX Hedging Agent | assistive | Foreign exchange exposure analysis |
| 56 | Period Close Agent | semi_autonomous | Automated period-end checks and accruals |
| 57 | Aging Predictor Agent | autonomous | Predicts payment delays and high-risk receivables |
| 58 | Credit Scoring Agent | autonomous | Customer creditworthiness assessment |
| 59 | Intercompany Reconciler Agent | autonomous | Cross-entity transaction matching |
| 60 | Spend Analyzer Agent | autonomous | Procurement spend analytics |

### Compliance & Risk Agents (18 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 61 | Customs Filing Agent | semi_autonomous | Automated customs declaration preparation |
| 62 | HS Code Classifier Agent | autonomous | Automatic HS tariff code classification |
| 63 | Sanctions Screener Agent | autonomous | Entity screening against global sanctions lists |
| 64 | AEO Compliance Agent | monitoring | Authorized Economic Operator compliance |
| 65 | DG Classifier Agent | autonomous | IMDG class determination for dangerous goods |
| 66 | DG Segregation Agent | autonomous | Dangerous goods incompatibility checking |
| 67 | MARPOL Monitor Agent | monitoring | Environmental compliance monitoring |
| 68 | CII Rating Agent | autonomous | Carbon Intensity Indicator monitoring |
| 69 | Carbon Calculator Agent | autonomous | Carbon footprint tracking per shipment/voyage/fleet |
| 70 | Claims Predictor Agent | autonomous | Cargo claim likelihood estimation |
| 71 | Loss Prevention Agent | monitoring | Incident pattern detection |
| 72 | Risk Scorer Agent | autonomous | Operational risk assessment |
| 73 | Insurance Optimizer Agent | assistive | Coverage gap analysis |
| 74 | PSC Readiness Agent | semi_autonomous | Port State Control inspection preparation |
| 75 | ESG Reporter Agent | semi_autonomous | Sustainability metrics and ESG report generation |
| 76 | Pre-Arrival Agent | autonomous | Vessel pre-arrival documentation |
| 77 | Regulatory Filing Agent | semi_autonomous | Auto-prepares regulatory documents |
| 78 | Regulatory Reporter Agent | semi_autonomous | Automated compliance report generation |

### HR & Procurement Agents (6 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 79 | Crew Planner Agent | semi_autonomous | Crew rotation planning (certifications, rest, visas) |
| 80 | Certificate Tracker Agent | monitoring | Certificate/document expiry tracking |
| 81 | PO Generator Agent | semi_autonomous | Purchase order automation with approvals |
| 82 | Vendor Scorer Agent | autonomous | Supplier performance scoring |
| 83 | AP Matcher Agent | autonomous | Three-way match of PO, receipt, and invoice |
| 84 | OCR Invoice Agent | autonomous | Structured data extraction from scanned invoices |

### Platform & Analytics Agents (16 agents)

| # | Agent | Type | Description |
|---|-------|------|-------------|
| 85 | Data Quality Agent | autonomous | Master data validation and deduplication |
| 86 | KPI Monitor Agent | autonomous | Operational KPI tracking with real-time dashboards |
| 87 | Predictive Analytics Agent | autonomous | Multi-domain trend forecasting |
| 88 | Benchmark Agent | autonomous | Industry benchmark comparison |
| 89 | Audit Trail Agent | autonomous | Continuous transaction monitoring |
| 90 | SLA Monitor Agent | monitoring | Service level tracking and breach detection |
| 91 | Integration Monitor Agent | monitoring | API/EDI integration health monitoring |
| 92 | Workflow Router Agent | autonomous | Intelligent task routing by workload/expertise |
| 93 | Notification Optimizer Agent | autonomous | Smart alert prioritization |
| 94 | Incident Investigator Agent | assistive | Root cause analysis assistance |
| 95 | Onboarding Agent | assistive | Guided setup for new users and tenants |
| 96 | Cargo Tracker Agent | autonomous | Real-time shipment visibility with milestones |
| 97 | Demand Forecaster Agent | autonomous | Booking volume prediction per trade lane |
| 98 | Report Generator Agent | autonomous | Natural-language report generation from KPIs |
| 99 | SOP Updater Agent | monitoring | Flags outdated SOPs based on process changes |
| 100 | Training Recommender Agent | assistive | Recommends training based on user activity |

---

## API Endpoints

### Manage Agents

```
GET    /api/v1/ai-agent-framework/agents          # List all agents
GET    /api/v1/ai-agent-framework/agents/[id]      # Get agent details
PATCH  /api/v1/ai-agent-framework/agents/[id]      # Update agent config
```

### Execute Agents

```
POST   /api/v1/ai-agent-framework/orchestrate      # Orchestrate multi-agent task
GET    /api/v1/ai-agent-framework/runs              # List execution runs
GET    /api/v1/ai-agent-framework/runs/[id]         # Get run details
```

### Document Processing

```
POST   /api/v1/ai-agent-framework/documents/process # Submit document for processing
GET    /api/v1/ai-agent-framework/documents/jobs     # List processing jobs
```

### Escalations

```
GET    /api/v1/ai-agent-framework/escalations       # List pending escalations
PATCH  /api/v1/ai-agent-framework/escalations/[id]  # Resolve escalation
```

---

## Configuration

Agents are configured per tenant via the Admin Portal:

1. Navigate to **Admin Portal** > **AI Agent Configs**
2. Select an agent to view/edit its configuration
3. Assign AI model (provider + model combination)
4. Set execution parameters (temperature, max tokens, timeout)
5. Configure escalation rules and thresholds
6. Set budget limits (max tokens per month)
7. Enable/disable agent as needed

---

## Monitoring

The AI Agent Dashboard provides:

- **Execution logs** -- Every agent action with input/output
- **Success/failure rates** -- Per agent and per module
- **Token usage** -- Cost tracking per provider
- **Override frequency** -- How often humans override agent decisions
- **Latency metrics** -- Average response time per agent

---

## Automation Statistics

| Metric | Count |
|--------|-------|
| Total Agents | 100 |
| Autonomous | ~45 |
| Semi-Autonomous | ~25 |
| Assistive | ~10 |
| Monitoring | ~20 |
