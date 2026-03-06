# CS-ERP AI Agents Guide

CS-ERP integrates 100 specialized AI agents that automate, assist, and monitor container shipping operations. Agents are managed through the AI Agent Framework module.

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

---

## Agent Types

| Type | Behavior | Human Involvement |
|------|----------|-------------------|
| **Autonomous** | Executes end-to-end without human input | Results reviewed periodically |
| **Semi-Autonomous** | Executes but requires human approval at key steps | Approval at decision points |
| **Assistive** | Provides recommendations for human decision-making | Human makes final decision |
| **Monitoring** | Continuously watches for anomalies and alerts | Human investigates alerts |

---

## Complete Agent Directory

### Sales & Commercial Agents
| Agent | Type | Description |
|-------|------|-------------|
| Lead Scoring Agent | autonomous | Qualifies and prioritizes sales leads based on engagement and fit |
| Campaign Optimizer Agent | semi_autonomous | Marketing campaign optimization for trade lane promotions |
| Quote Generator Agent | semi_autonomous | Auto-generates freight quotes from customer inquiries |
| Rate Optimizer Agent | autonomous | Dynamic pricing and market rate analysis |
| Contract Compliance Agent | monitoring | Monitors contract terms, volume commitments, and renewals |
| Customer Churn Predictor | monitoring | Identifies at-risk customers from booking patterns |
| Customer Revenue Agent | autonomous | Customer profitability and lifetime value calculation |
| Customer Segmentation Agent | autonomous | Segments customers by behavior, revenue, and trade patterns |
| Market Intelligence Agent | autonomous | Competitor rate monitoring and market trend analysis |
| Surcharge Calculator Agent | autonomous | Dynamic BAF, CAF, THC, and special handling surcharges |
| Trade Lane Analyzer Agent | autonomous | Profitability analysis by trade lane |

### Booking & Documentation Agents
| Agent | Type | Description |
|-------|------|-------------|
| Booking Validator Agent | autonomous | Validates bookings for space, equipment, and compliance |
| BL Generator Agent | semi_autonomous | Auto-populates Bill of Lading with compliance checks |
| Shipping Instruction Agent | autonomous | Processes and validates shipping instructions |
| Manifest Compiler Agent | autonomous | Compiles and validates cargo manifests |
| Document Validator Agent | semi_autonomous | OCR-based document validation |
| Cargo Release Agent | semi_autonomous | Processes delivery orders with hold checks |
| VGM Validator Agent | autonomous | Verified Gross Mass validation (SOLAS) |
| Invoice Generator Agent | semi_autonomous | Auto-generates invoices from BL data and tariffs |

### Vessel & Voyage Agents
| Agent | Type | Description |
|-------|------|-------------|
| Voyage Optimizer Agent | semi_autonomous | Route and speed optimization for fuel efficiency |
| Voyage P&L Agent | autonomous | Real-time voyage profitability tracking |
| Voyage Analytics Agent | autonomous | Multi-dimensional voyage performance analysis |
| ETA Predictor Agent | autonomous | Arrival prediction using AIS, weather, and port data |
| Speed Optimizer Agent | autonomous | CII-aware speed recommendations |
| Weather Routing Agent | autonomous | Weather-aware routing with sea state forecasts |
| Noon Report Analyzer Agent | autonomous | Vessel performance monitoring from noon reports |
| Fleet Deployment Agent | semi_autonomous | Vessel-to-route assignment optimization |
| Fleet Utilization Agent | autonomous | Fleet efficiency covering capacity and idle time |
| Capacity Forecaster Agent | autonomous | Space utilization prediction and overbooking |
| Stowage Planner Agent | semi_autonomous | Optimal container placement (weight, DG, reefer) |
| Charter Party Analyzer Agent | assistive | Charter party term analysis vs market standards |

### Container & Equipment Agents
| Agent | Type | Description |
|-------|------|-------------|
| Container Allocation Agent | autonomous | Optimal container type/unit selection |
| Container Damage Assessor | semi_autonomous | Image-based damage classification and repair costing |
| Empty Repo Optimizer Agent | semi_autonomous | Empty container repositioning optimization |
| Demurrage Calculator Agent | autonomous | Automated D&D calculation from tariffs and events |
| Reefer Monitor Agent | autonomous | Temperature anomaly detection for reefer cargo |
| PTI Scheduler Agent | autonomous | Pre-trip inspection scheduling for reefers |
| Lease Evaluator Agent | assistive | Container lease vs buy analysis with TCO modeling |
| GPS Tracker Agent | autonomous | Container/vehicle position monitoring with geofencing |
| IoT Alert Agent | autonomous | Sensor anomaly detection for container/vessel IoT |

### Port & Terminal Agents
| Agent | Type | Description |
|-------|------|-------------|
| Berth Allocation Agent | semi_autonomous | Optimal berth planning by vessel size and schedule |
| Port Call Optimizer Agent | semi_autonomous | Optimize anchorage, berth, and cargo operations |
| Port Tariff Agent | autonomous | Port tariff calculation and validation |
| Port Turnaround Optimizer | semi_autonomous | Minimize port stay through optimized sequencing |
| Disbursement Estimator Agent | autonomous | Proforma Disbursement Account calculation |
| Transshipment Planner Agent | semi_autonomous | Hub optimization for transshipment routing |
| Intermodal Planner Agent | semi_autonomous | Multimodal route optimization (sea/road/rail) |
| Last Mile Optimizer Agent | autonomous | Delivery route optimization for last mile |

### Finance & Accounting Agents
| Agent | Type | Description |
|-------|------|-------------|
| Cash Application Agent | autonomous | Automatic payment-to-invoice matching |
| Cash Flow Predictor Agent | autonomous | Working capital forecasting |
| Revenue Recognition Agent | autonomous | IFRS 15 compliant revenue recognition |
| Budget Variance Agent | monitoring | Auto-flags budget deviations |
| Cost Anomaly Agent | monitoring | Detects unusual cost patterns |
| Fraud Detection Agent | autonomous | Anomalous financial transaction detection |
| FX Hedging Agent | assistive | Foreign exchange exposure analysis |
| Period Close Agent | semi_autonomous | Automated period-end checks and accruals |
| Aging Predictor Agent | autonomous | Predicts payment delays and high-risk receivables |
| Credit Scoring Agent | autonomous | Customer creditworthiness assessment |
| Intercompany Reconciler Agent | autonomous | Cross-entity transaction matching |
| Spend Analyzer Agent | autonomous | Procurement spend analytics |

### Compliance & Risk Agents
| Agent | Type | Description |
|-------|------|-------------|
| Customs Filing Agent | semi_autonomous | Automated customs declaration preparation |
| HS Code Classifier Agent | autonomous | Automatic HS tariff code classification |
| Sanctions Screener Agent | autonomous | Entity screening against global sanctions lists |
| AEO Compliance Agent | monitoring | Authorized Economic Operator compliance |
| DG Classifier Agent | autonomous | IMDG class determination for dangerous goods |
| DG Segregation Agent | autonomous | Dangerous goods incompatibility checking |
| MARPOL Monitor Agent | monitoring | Environmental compliance monitoring |
| CII Rating Agent | autonomous | Carbon Intensity Indicator monitoring |
| Carbon Calculator Agent | autonomous | Carbon footprint tracking per shipment/voyage/fleet |
| Claims Predictor Agent | autonomous | Cargo claim likelihood estimation |
| Loss Prevention Agent | monitoring | Incident pattern detection |
| Risk Scorer Agent | autonomous | Operational risk assessment |
| Insurance Optimizer Agent | assistive | Coverage gap analysis |
| PSC Readiness Agent | semi_autonomous | Port State Control inspection preparation |
| ESG Reporter Agent | semi_autonomous | Sustainability metrics and ESG report generation |
| Pre-Arrival Agent | autonomous | Vessel pre-arrival documentation |
| Regulatory Filing Agent | semi_autonomous | Auto-prepares regulatory documents |
| Regulatory Reporter Agent | semi_autonomous | Automated compliance report generation |

### HR & Procurement Agents
| Agent | Type | Description |
|-------|------|-------------|
| Crew Planner Agent | semi_autonomous | Crew rotation planning (certifications, rest, visas) |
| Certificate Tracker Agent | monitoring | Certificate/document expiry tracking |
| PO Generator Agent | semi_autonomous | Purchase order automation with approvals |
| Vendor Scorer Agent | autonomous | Supplier performance scoring |
| AP Matcher Agent | autonomous | Three-way match of PO, receipt, and invoice |
| OCR Invoice Agent | autonomous | Structured data extraction from scanned invoices |

### Platform & Analytics Agents
| Agent | Type | Description |
|-------|------|-------------|
| Data Quality Agent | autonomous | Master data validation and deduplication |
| KPI Monitor Agent | autonomous | Operational KPI tracking with real-time dashboards |
| Predictive Analytics Agent | autonomous | Multi-domain trend forecasting |
| Benchmark Agent | autonomous | Industry benchmark comparison |
| Audit Trail Agent | autonomous | Continuous transaction monitoring |
| SLA Monitor Agent | monitoring | Service level tracking and breach detection |
| Integration Monitor Agent | monitoring | API/EDI integration health monitoring |
| Workflow Router Agent | autonomous | Intelligent task routing by workload/expertise |
| Notification Optimizer Agent | autonomous | Smart alert prioritization |
| Incident Investigator Agent | assistive | Root cause analysis assistance |
| Onboarding Agent | assistive | Guided setup for new users and tenants |
| Cargo Tracker Agent | autonomous | Real-time shipment visibility with milestones |
| Demand Forecaster Agent | autonomous | Booking volume prediction per trade lane |

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

Agents are configured via the Admin Portal:
1. Navigate to **Admin Portal** > **AI Agent Configs**
2. Select an agent to view/edit its configuration
3. Assign AI model (provider + model combination)
4. Set execution parameters (temperature, max tokens, timeout)
5. Configure escalation rules and thresholds
6. Enable/disable agent as needed
