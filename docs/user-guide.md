# CS-ERP User Guide

This guide covers day-to-day usage of CS-ERP for container shipping operations.

---

## Getting Started

### Logging In

1. Navigate to your CS-ERP instance URL
2. Enter your email address and password
3. Click **Sign In**
4. On first login, you will be prompted to change your temporary password

Your session uses secure JWT tokens (15-minute access, 30-day refresh with rotation). Sessions are automatically refreshed -- no need to re-login during active use.

### First-Time Setup

After your first login, you will be guided through:

- Company profile configuration (if tenant admin)
- User preferences: language (English/Arabic), timezone, date format
- Dashboard widget customization
- Notification channel preferences

### Dashboard

After login, you land on the main dashboard showing:

- **Key metrics** -- TEU volume, revenue, vessel utilization, pending tasks
- **Recent activity** -- latest bookings, BL releases, approvals
- **Alerts** -- overdue items, compliance warnings, AI agent notifications
- **Quick actions** -- create booking, search container, view schedule

### Navigation

The sidebar organizes modules into groups:

| Group | Modules |
|-------|---------|
| Sales & Commercial | CRM, Pricing, Revenue, Agents, Customer Service, Portal |
| Booking & Documentation | Operations, Freight Invoicing, Document Management |
| Vessel & Voyage | Schedule, Capacity, Chartering, Fleet, Performance, Technical |
| Container & Equipment | Equipment Control, Leasing, Repositioning, Reefer, D&D, IoT |
| Port & Terminal | Port Agency, Disbursements, Tariffs, Transshipment, Intermodal |
| Finance | GL, AP, AR, Costing, Treasury, Fixed Assets, Multi-Entity |
| Bunker & Fuel | Bunker procurement, quality, emissions |
| Compliance & Risk | Customs, DG, MARPOL, Audit, Insurance, Claims, ESG |
| HR & Procurement | Shore Staff HR, Crew, Procurement |
| AI & Analytics | Agent Framework, BI Dashboards |
| Admin | System Config, Master Data, Workflows, Integrations |

Your visible modules depend on your assigned role and permissions.

Use the search bar (**Ctrl+K**) to quickly find any page, entity, or record.

---

## Core Workflows

### Booking Workflow

1. **Quote** -- Sales creates a rate quotation from Commercial Pricing
2. **Booking Request** -- Customer submits via portal or agent enters manually
3. **Booking Confirmation** -- Operations confirms space, assigns container
4. **Shipping Instructions** -- Customer provides SI; operations validates
5. **Bill of Lading** -- Draft BL generated, customer approves, BL issued
6. **Invoice** -- Freight invoice auto-generated from BL and tariff data
7. **Cargo Tracking** -- Real-time updates via IoT and vessel position

### Vessel Schedule Workflow

1. **Trade Route Setup** -- Define service strings and port rotations
2. **Voyage Planning** -- Create voyage with ETA/ETD per port
3. **Capacity Allocation** -- Set TEU limits per port pair
4. **Bay Planning** -- Stowage plan for container placement
5. **Departure** -- Confirm vessel departure, update positions
6. **Arrival** -- Port call coordination, terminal handoff
7. **Voyage Settlement** -- Calculate actual P&L vs. budget

### Financial Workflow

1. **Invoice Generation** -- Auto from BL or manual entry
2. **Approval Routing** -- Workflow engine routes for authorization
3. **GL Posting** -- Journal entries created automatically
4. **Payment Processing** -- Cash application or vendor payment
5. **Period Close** -- Reconciliation, accruals, financial statements

### Demurrage & Detention

1. Navigate to **Demurrage & Detention** > **Calculations**
2. System automatically tracks container events and free-time
3. D&D Calculator Agent computes charges based on tariffs
4. Review calculations and apply any waivers
5. Generate and send D&D invoice

---

## Role-Based Access

CS-ERP uses role-based permissions in the format `{module}:{action}`.

### Standard Roles

| Role | Description | Typical Permissions |
|------|-------------|---------------------|
| Super Admin | Full system access | All permissions |
| Tenant Admin | Full access within tenant | All except cross-tenant |
| Operations Manager | Manages bookings and vessel ops | `booking:*`, `vessel:*`, `operations:*` |
| Finance Manager | Full finance access | `gl:*`, `ar:*`, `ap:*`, `treasury:*` |
| Commercial Manager | Sales and pricing | `sales:*`, `pricing:*`, `revenue:*` |
| Sales Executive | Customer-facing sales | `sales:read`, `sales:create`, `booking:create` |
| Documentation Clerk | BL and document processing | `operations:read`, `operations:create`, `dms:*` |
| Vessel Planner | Schedule and capacity | `schedule:*`, `capacity:*`, `fleet:*` |
| Vessel Manager | Fleet and technical operations | `vessel:*`, `crew:*`, `bunker:*` |
| Compliance Officer | Regulatory modules | `customs:*`, `dg:*`, `marpol:*`, `audit:*` |
| Customer (Portal) | Self-service access | `portal:read`, `portal:create` |
| Read Only | View access across all modules | `*:read` |

### Permission Actions

- `read` -- View records and reports
- `create` -- Create new records
- `update` -- Modify existing records
- `delete` -- Soft-delete records
- `approve` -- Approve workflows and transactions
- `manage` -- Full administrative control

---

## Customer Portal

Customers with portal access can:

- **Track Shipments** -- Real-time container and vessel tracking with milestone timeline
- **Submit Bookings** -- Create booking requests with SI upload
- **View Documents** -- Download BLs, invoices, arrival notices
- **Manage Invoices** -- View outstanding invoices and payment history
- **Submit Claims** -- File cargo damage or loss claims
- **Access Reports** -- Volume analytics, transit time reports

Portal access is granted by the operations team and linked to the customer's account in Sales & CRM.

---

## Common Tasks

### Searching Records

Every list page supports:

- **Text search** -- Search by reference number, name, or code
- **Filters** -- Status, date range, port, vessel, customer
- **Sorting** -- Click column headers to sort ascending/descending
- **Export** -- Download filtered results as CSV or PDF (large exports run in background)

### Working with Tables

- Tables use cursor-based pagination (50 rows per page)
- Click any row to view details
- Bulk actions available via checkbox selection
- Column visibility is customizable per user

### Approval Workflows

- Items requiring approval show an **Approval** badge
- Click to review details and approve/reject with optional comments
- Approval rules are configured per module in Admin > Approval Matrices
- Escalation happens automatically when approvals exceed configured timeout

### Notifications

The notification bell shows:

- Approval requests awaiting your action
- Workflow status changes on records you own
- System alerts (compliance deadlines, overdue items)
- AI agent recommendations requiring human review

### Dark Mode

Toggle dark mode from the user menu (top-right avatar). The setting persists across sessions.

### RTL / Arabic Support

CS-ERP fully supports Arabic (RTL) layout. Language preference is set in user profile settings. All layouts, tables, and forms adapt automatically using logical CSS properties.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Global search |
| `Ctrl+N` | New record (context-aware) |
| `Ctrl+S` | Save current form |
| `Escape` | Close modal / cancel |

---

## Getting Help

- **Knowledge Base** -- Access SOPs and guides via Knowledge Management module
- **Support Tickets** -- Submit via Customer Service Operations
- **AI Assistance** -- AI agents provide contextual suggestions throughout the system (look for the AI icon)
- All data supports Arabic (RTL) display -- switch language in user preferences
- Dark mode is available via the theme toggle in the header
