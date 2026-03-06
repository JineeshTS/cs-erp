# CS-ERP Administrator Guide

## Overview

System administrators manage tenant configuration, user accounts, roles, AI providers, module settings, and system health through the Admin Portal module.

---

## Tenant Management

### Tenant Setup
Each tenant represents a shipping company or business unit with complete data isolation enforced by PostgreSQL Row-Level Security.

- Navigate to **Admin Portal** > **Master Data Configs**
- Configure company name, registration, tax IDs
- Set up operational regions (Qatar, UAE, KSA, India)
- Configure base currency and multi-currency support
- Upload company logo and branding

### Multi-Entity Structure
For shipping groups with multiple legal entities:
- Use the **Multi-Entity Legal Structure** module
- Configure parent-subsidiary relationships
- Set up intercompany transaction rules
- Define consolidation mappings

---

## User Management

### Creating Users
1. Navigate to **Admin** > **Users**
2. Click **Add User**
3. Enter email, name, and department
4. Assign one or more roles
5. Set initial password (user must change on first login)

**API:** `POST /api/v1/admin/users`

### Managing Users
- View all users: `GET /api/v1/admin/users`
- Update user: `PATCH /api/v1/admin/users/[userId]`
- Deactivate user: Set `active: false` (soft disable, never hard delete)

---

## Role & Permission Management

### Built-in Roles
The system includes predefined roles that can be customized:
- **Super Admin** -- Full system access
- **Commercial Manager** -- Sales, pricing, contracts
- **Operations Manager** -- Bookings, vessels, documentation
- **Finance Manager** -- All financial modules
- **Customer Service** -- Support and portal management
- **Vessel Manager** -- Fleet and technical operations
- **Compliance Officer** -- Regulatory and audit modules
- **Read Only** -- View access across all modules

### Custom Roles
1. Navigate to **Admin** > **Roles**
2. Click **Create Role**
3. Enter role name and description
4. Select permissions from the permission matrix

**Permission Format:** `{module}:{action}`

Available actions per module:
- `read` -- View records
- `create` -- Create new records
- `update` -- Modify records
- `delete` -- Soft-delete records
- `approve` -- Approve workflows
- `manage` -- Full administrative access

**API:** `POST /api/v1/admin/roles`, `PATCH /api/v1/admin/roles/[roleId]`

---

## AI Provider Configuration

### Setting Up AI Providers
1. Navigate to **Admin Portal** > **AI Agent Configs**
2. Configure AI providers (OpenAI, Anthropic, Google, Azure, etc.)
3. Enter API keys and endpoint URLs
4. Set rate limits and budget caps per provider

### Model Assignments
- Each of the 100 AI agents can be assigned to a specific model
- Configure model parameters: temperature, max tokens, timeout
- Set fallback models for high-availability
- Monitor token usage and costs via `ai_usage_logs`

### Agent Configuration
- Enable/disable individual agents
- Set escalation thresholds (when to involve humans)
- Configure agent-specific parameters
- Review execution history in `aaf_agent_runs`

---

## Module Configuration

### Enabling/Disabling Modules
1. Go to **Admin Portal** > **Module Configs**
2. Toggle modules on/off for your tenant
3. Configure module-specific settings (currencies, thresholds, defaults)

### Feature Flags
1. Navigate to **Admin Portal** > **Feature Flags**
2. Create or toggle feature flags
3. Target specific users, roles, or percentages
4. Use for gradual rollouts or A/B testing

---

## Approval Workflows

### Setting Up Approval Matrices
1. Go to **Admin Portal** > **Approval Matrices**
2. Define approval rules per module and action
3. Set threshold-based routing (e.g., invoices > $50K require CFO approval)
4. Configure multi-level approval chains
5. Set escalation timeouts

---

## Integration Management

### External System Connections
1. Navigate to **Admin Portal** > **Integration Endpoints**
2. Configure connections to external systems:
   - EDI partners (INTTRA, CargoSmart)
   - Banking systems
   - Customs authorities
   - Port community systems
   - Oracle/SAP (if applicable)
3. Set up webhook URLs for event notifications
4. Monitor integration health

---

## System Health & Monitoring

### Health Metrics
- Navigate to **Admin Portal** > **System Health Metrics**
- Monitor: API response times, database performance, queue depths
- View error rates and system uptime
- Health check endpoint: `GET /api/health`

### Audit Logs
- All system actions are logged in **Admin Portal** > **Audit Logs**
- Track: user actions, data changes, login attempts, permission changes
- Audit logs are immutable and retained per compliance requirements
- Filter by user, module, action type, or date range

### Data Import/Export
- Navigate to **Admin Portal** > **Import/Export Jobs**
- Import master data (ports, vessels, customers) via CSV/Excel
- Export data for reporting or migration
- Large operations run as background jobs via BullMQ

---

## Notification Configuration

### Setting Up Notifications
1. Go to **Admin Portal** > **Notification Configs**
2. Configure notification channels: email, SMS, push, in-app
3. Set up notification rules per event type
4. Configure escalation paths for unacknowledged alerts
5. Customize notification templates

---

## License Management

- View active licenses in **Admin Portal** > **Licenses**
- Monitor user count against license limits
- Track module-level licensing
- Renewal alerts for expiring licenses

---

## Backup & Recovery

- Database backups run automatically via PostgreSQL tooling
- Point-in-time recovery available
- Contact infrastructure team for restore requests
- Test restore procedures quarterly
