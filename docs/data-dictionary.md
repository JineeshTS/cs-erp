# CS-ERP Data Dictionary

This document defines shipping industry terminology, entity definitions, status codes, and standard abbreviations used throughout CS-ERP.

---

## Shipping Industry Glossary

### Vessel & Voyage Terms

| Term | Definition |
|------|-----------|
| **TEU** | Twenty-foot Equivalent Unit; standard measure of container capacity (1 TEU = 20ft container) |
| **FEU** | Forty-foot Equivalent Unit; equals 2 TEU |
| **ETA** | Estimated Time of Arrival |
| **ETD** | Estimated Time of Departure |
| **ATA** | Actual Time of Arrival |
| **ATD** | Actual Time of Departure |
| **ETB** | Estimated Time of Berthing |
| **Noon Report** | Daily vessel performance report submitted at 1200 hours |
| **CII** | Carbon Intensity Indicator; IMO efficiency rating (A-E) |
| **EEXI** | Energy Efficiency Existing Ship Index |
| **Service String** | Fixed rotation of ports served by vessels on a regular schedule |
| **Port Rotation** | Ordered sequence of ports a vessel calls on a single voyage |
| **Blank Sailing** | Scheduled voyage that is cancelled |
| **Extra Loader** | Additional vessel deployed outside regular schedule |
| **Vessel Swap** | Replacing one vessel with another on a scheduled service |
| **Proforma** | Estimated voyage schedule and financials before execution |
| **Ballast Voyage** | Sailing without cargo (empty) to reposition a vessel |

### Charter Party Terms

| Term | Definition |
|------|-----------|
| **Time Charter (TC)** | Chartering a vessel for a fixed period; charterer pays daily hire |
| **Voyage Charter** | Chartering for a single voyage; owner covers operating costs |
| **Hire Rate** | Daily rate paid for time-chartered vessel (USD/day) |
| **Off-Hire** | Period when vessel is unavailable; hire payments suspended |
| **Laycan** | Laydays/cancelling date range for vessel delivery |
| **Laytime** | Time allowed for loading and discharging without penalty |
| **NOR** | Notice of Readiness; formal notice vessel is ready for operations |
| **Demurrage** | Charge for vessel time in port exceeding allowed laytime |
| **Despatch** | Rebate for completing port operations faster than laytime |

### Cargo & Container Terms

| Term | Definition |
|------|-----------|
| **B/L (Bill of Lading)** | Legal document of title for shipped goods; contract of carriage |
| **SI (Shipping Instructions)** | Customer-provided details for BL preparation |
| **VGM** | Verified Gross Mass; mandatory container weight declaration (SOLAS) |
| **FCL** | Full Container Load; one shipper per container |
| **LCL** | Less than Container Load; multiple shippers per container |
| **OOG** | Out of Gauge; cargo exceeding standard container dimensions |
| **Reefer** | Refrigerated container for temperature-sensitive cargo |
| **DG** | Dangerous Goods; cargo classified under IMDG Code |
| **IMDG** | International Maritime Dangerous Goods Code |
| **PTI** | Pre-Trip Inspection; reefer container check before loading |
| **M&R** | Maintenance and Repair (containers) |
| **Stuffing** | Loading cargo into a container |
| **Destuffing** | Unloading cargo from a container |
| **SOC** | Shipper Owned Container |
| **COC** | Carrier Owned Container |
| **Container Types** | 20DC (dry), 40HC (high cube), 40OT (open top), 20FR (flat rack), 20RFR (reefer), Tank |

### Port & Terminal Terms

| Term | Definition |
|------|-----------|
| **PDA** | Proforma Disbursement Account; estimated port call costs |
| **FDA** | Final Disbursement Account; actual port call costs |
| **THC** | Terminal Handling Charge |
| **Berth** | Designated dock position for vessel loading/unloading |
| **Quay Crane** | Crane on the quayside for container handling |
| **RTG** | Rubber-Tyred Gantry crane for yard operations |
| **ICD** | Inland Container Depot; inland facility for customs clearance |
| **CFS** | Container Freight Station; for LCL consolidation |
| **Free Time** | Period before demurrage/detention charges begin |
| **D&D** | Demurrage and Detention charges on containers |
| **Transshipment** | Transferring cargo between vessels at an intermediate port |
| **Relay** | Transshipment connection between two vessels |
| **Dwell Time** | Duration a container stays at a terminal/yard |
| **UN/LOCODE** | United Nations Location Code for ports and terminals (5 chars) |

### Financial Terms

| Term | Definition |
|------|-----------|
| **Freight** | Charge for transporting cargo |
| **BAF** | Bunker Adjustment Factor; fuel surcharge |
| **CAF** | Currency Adjustment Factor |
| **PSS** | Peak Season Surcharge |
| **GRI** | General Rate Increase |
| **Debit Note** | Additional charge to customer |
| **Credit Note** | Reduction or reversal of a charge |
| **Three-Way Match** | Matching PO, goods receipt, and vendor invoice |
| **Dunning** | Process of sending payment reminders |
| **Accrual** | Recording revenue/expense before cash is received/paid |
| **Transfer Pricing** | Pricing for transactions between related entities |
| **Consolidation** | Combining financial statements of multiple entities |

### Compliance Terms

| Term | Definition |
|------|-----------|
| **MARPOL** | International Convention for Prevention of Marine Pollution |
| **SOLAS** | Safety of Life at Sea convention |
| **ISM Code** | International Safety Management Code |
| **ISPS** | International Ship and Port Facility Security Code |
| **AEO** | Authorized Economic Operator (customs trusted trader) |
| **HS Code** | Harmonized System code for commodity classification |
| **MLC** | Maritime Labour Convention (crew rights) |
| **P&I** | Protection and Indemnity (marine insurance) |
| **SOx** | Sulphur oxides; regulated emissions |
| **NOx** | Nitrogen oxides; regulated emissions |
| **IMO 2020** | Sulphur cap regulation (0.50% max sulphur content) |
| **ESG** | Environmental, Social, and Governance reporting |
| **PSC** | Port State Control inspection |

### EDI & Data Exchange

| Term | Definition |
|------|-----------|
| **EDI** | Electronic Data Interchange; standardized messaging between partners |
| **BAPLIE** | Bayplan/stowage plan message (UN/EDIFACT) |
| **COPARN** | Container pre-announcement message |
| **CUSCAR** | Customs cargo report message |
| **IFTMIN** | Instruction message for transport/dangerous goods |
| **CODECO** | Container gate-in/gate-out report |
| **INVOIC** | Invoice message |

---

## Entity Definitions

### Core Entities

| Entity | Description | Key Identifier |
|--------|-------------|----------------|
| Tenant | Shipping company / business entity | UUID |
| User | System user with login credentials | Email |
| Role | Named permission set | Role name |
| Port | Physical port location | UN/LOCODE (e.g., AEDXB) |
| Vessel | Ship in the fleet | IMO number |
| Voyage | Single journey of a vessel | Voyage number (e.g., V042/2026) |
| Customer | Shipper, consignee, or freight forwarder | Customer code |
| Vendor | Supplier of goods or services | Vendor code |
| Container | Shipping container unit | Container number (ISO 6346) |
| Booking | Cargo space reservation | Booking number |
| Bill of Lading | Transport document / title | BL number |
| Invoice | Financial charge document | Invoice number |

### Reference Data Entities

| Entity | Description | Standard |
|--------|-------------|----------|
| Currency | ISO currency | ISO 4217 (USD, QAR, AED, SAR, INR) |
| Country | ISO country | ISO 3166-1 alpha-2 |
| Port Code | Port identifier | UN/LOCODE (5 chars) |
| Container Type | Size/type code | ISO 6346 |
| HS Code | Commodity code | WCO Harmonized System |
| IMDG Class | DG classification | IMO IMDG Code (Classes 1-9) |

---

## Status Codes

### Booking Status

| Code | Display Name | Description |
|------|-------------|-------------|
| `draft` | Draft | Initial creation, not yet submitted |
| `pending` | Pending | Submitted, awaiting confirmation |
| `confirmed` | Confirmed | Space confirmed, container assigned |
| `amended` | Amended | Modification requested and processed |
| `loaded` | Loaded | Cargo loaded on vessel |
| `discharged` | Discharged | Cargo discharged from vessel |
| `completed` | Completed | Cargo delivered |
| `cancelled` | Cancelled | Booking cancelled |

### BL Status

| Code | Display Name | Description |
|------|-------------|-------------|
| `draft` | Draft | BL being prepared |
| `pending_approval` | Pending Approval | Awaiting customer approval |
| `approved` | Approved | Customer approved draft |
| `issued` | Issued | BL officially issued |
| `surrendered` | Surrendered | Original BL returned to carrier |
| `released` | Released | Cargo release authorized |
| `delivered` | Delivered | Cargo handed over to consignee |
| `archived` | Archived | BL archived after completion |
| `cancelled` | Cancelled | Voided/replaced/rejected |

### Invoice Status

| Code | Display Name | Description |
|------|-------------|-------------|
| `draft` | Draft | Invoice being prepared |
| `pending_approval` | Pending Approval | Awaiting internal approval |
| `approved` | Approved | Approved for issuance |
| `issued` | Issued | Sent to customer |
| `partially_paid` | Partially Paid | Partial payment received |
| `paid` | Paid | Fully settled |
| `overdue` | Overdue | Past payment due date |
| `voided` | Voided | Cancelled/reversed |
| `disputed` | Disputed | Customer raised dispute |

### Vessel/Voyage Status

| Code | Display Name | Description |
|------|-------------|-------------|
| `planned` | Planned | Voyage scheduled, not yet departed |
| `departed` | Departed | Vessel left port |
| `in_transit` | In Transit | Vessel sailing between ports |
| `arrived` | Arrived | Vessel arrived at port |
| `at_berth` | At Berth | Vessel berthed, operations ongoing |
| `completed` | Completed | Voyage completed |
| `cancelled` | Cancelled | Voyage cancelled (blank sailing) |

### Container Status

| Code | Display Name | Description |
|------|-------------|-------------|
| `available` | Available | Empty, ready for use |
| `allocated` | Allocated | Assigned to a booking |
| `gate_in` | Gate In | Entered terminal/depot |
| `loaded` | Loaded | On vessel |
| `in_transit` | In Transit | On vessel, sailing |
| `discharged` | Discharged | Unloaded from vessel |
| `gate_out` | Gate Out | Left terminal/depot |
| `in_repair` | In Repair | Undergoing M&R |
| `damaged` | Damaged | Damage reported |
| `off_hire` | Off Hire | Returned to lessor |
| `retired` | Retired | End of service life |

### Workflow Status

| Code | Display Name | Description |
|------|-------------|-------------|
| `pending` | Pending | Awaiting action |
| `in_progress` | In Progress | Being processed |
| `approved` | Approved | Approved by authorized user |
| `rejected` | Rejected | Rejected with reason |
| `escalated` | Escalated | Escalated to higher authority |
| `completed` | Completed | Action completed |

---

## Number Formats

| Entity | Format | Example |
|--------|--------|---------|
| Booking Number | `BK-{YYYYMM}-{SEQ}` | BK-202603-00142 |
| BL Number | `CSBL{YYYY}{SEQ}` | CSBL202600831 |
| Invoice Number | `INV-{YYYY}-{SEQ}` | INV-2026-005421 |
| Voyage Number | `V{SEQ}/{YYYY}` | V042/2026 |
| Container Number | ISO 6346 (owner+serial+check) | CSEU1234567 |
| PO Number | `PO-{YYYY}-{SEQ}` | PO-2026-00089 |

---

## Key Relationships

- **Tenant** (1) -> (N) all other entities via `tenant_id`
- **Vessel** (1) -> (N) Voyages, Bunker Records, Crew Assignments
- **Voyage** (1) -> (N) Bookings, Port Calls, Containers, Bills of Lading
- **Booking** (1) -> (N) Containers, (1) Bill of Lading
- **Customer** (1) -> (N) Bookings, Invoices, Portal Access
- **Vendor** (1) -> (N) Purchase Orders, Invoices

---

## Notes

- All monetary values stored as `NUMERIC(18,4)` for precision
- All timestamps in UTC (`timestamptz` in PostgreSQL)
- Container numbers validated against ISO 6346 check digit
- All tables include `tenant_id` for multi-tenancy isolation
