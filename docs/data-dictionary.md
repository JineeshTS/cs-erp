# CS ERP Data Dictionary

This document defines key maritime/shipping terms, entity relationships, and status code enums used throughout the Container Shipping ERP system.

## Maritime & Shipping Terminology

### Core Concepts

**TEU (Twenty-foot Equivalent Unit)**
- Standard measurement for container capacity
- 1 TEU = 20-foot container (20×8×8.5 feet)
- 1 FEU (Forty-foot Equivalent Unit) = 2 TEU
- Used to express vessel capacity, booking volume, and port throughput

**Bill of Lading (B/L)**
- Primary transport document for ocean freight
- Contains shipper, consignee, vessel details, container numbers, cargo description, and terms
- Serves as contract of carriage and proof of ownership
- Types: Straight (non-negotiable) or Order (negotiable, transferable)
- References: shipper ID, consignee ID, carrier, vessel, voyage, booking

**Charter Party**
- Contractual agreement between vessel owner and shipper for entire or partial vessel capacity
- Types: Full ship charter, slot charter, space charter
- Defines terms: laytime, demurrage, freight rate, loading/discharge conditions

**Voyage**
- Single journey of vessel from departure port to arrival port(s)
- Identified by vessel + voyage number (e.g., "OOCL001-W2303")
- Contains: departure date, ETA, ports of call (with berths), cargo configuration
- Links to: vessel, bookings, containers, bills of lading, customs manifests

**Booking**
- Customer request to reserve container slots on a voyage
- Contains: shipper, consignee, commodity, container type/quantity, weight, dimensions
- Status progression: Pending → Confirmed → Loaded → Discharged → Closed
- Generates bill of lading upon confirmation

**Container**
- Physical cargo unit (20ft or 40ft standard container)
- Types: Dry (DC), High Cube (HC), Open Top (OT), Flat Rack (FR), Tank, Reefer (RFR)
- ID: International Container Tracking Number (4 letters + 7 digits, e.g., "OOCL1234567")
- Statuses: Empty, Loaded, In-Transit, At-Port, Damaged, Scrapped

### Port & Operations Terms

**Port Call**
- Single stop of vessel at a port to load/discharge cargo
- Contains: port code, berth, ETA, ETD, actual arrival, actual departure
- Estimated operations duration calculated from container volume

**Berth**
- Designated docking location at port (pier, quay, terminal)
- Capacity: max vessel length, max draft, container handling rate (containers/hour)
- Usage tracked: arrival time, departure time, duration

**Bill of Lading (B/L) Status Codes**
- `DRAFT` - Being prepared, not yet issued
- `ISSUED` - Officially issued by carrier
- `RELEASED` - Consignee authorized to collect cargo
- `DELIVERED` - Cargo handed over to consignee
- `CANCELLED` - Voided, replaced, or rejected

**Laytime**
- Time allowed for loading and discharging cargo without penalty
- Calculated from NOR (Notice of Readiness) at each port
- Measured in working days or calendar days per charter party

**NOR (Notice of Readiness)**
- Formal notification from vessel master to shipper/charterer that vessel is ready for loading/discharge
- Marks start of laytime and demurrage clock
- Timestamp recorded in port operations module

### Demurrage & Detention

**Demurrage**
- Charges incurred when vessel remains at port beyond allowed laytime
- Calculated per day/hour after laytime expires
- Applies during loading/discharging operations
- References: voyage ID, port call, calculated from NOR + laytime - actual duration

**Detention**
- Charges for keeping container or equipment beyond free release period
- Applied to shipper/consignee, not vessel
- Free period typically 5-7 days from discharge date
- References: booking ID, container ID, release date, detention end date

### Fuel & Environmental

**Bunker Fuel (Marine Fuel)**
- Heavy fuel oil (HFO), marine diesel oil (MDO), or liquified natural gas (LNG)
- Consumed during voyage at rate based on vessel, speed, weather
- Cost tracked per voyage, allocated to bookings
- Records: fuel grade, quantity (metric tons), cost, consumption rate

**CII (Carbon Intensity Indicator)**
- IMO metric for vessel carbon efficiency (grams CO2/TEU-mile)
- Annual rating: A (best) to E (worst)
- Compliance required; failure triggers corrective action plan
- Tracked per vessel, updated annually

**MARPOL (International Convention for Prevention of Pollution from Ships)**
- Regulation requiring ballast water treatment, oil record books, garbage logs
- Compliance tracked in voyage operations
- Violations reported to port state control

### EDI & Data Exchange

**EDI (Electronic Data Interchange)**
- Standardized electronic messaging between trading partners
- Used to transmit booking confirmations, manifests, customs declarations

**BAPLIE (Bayplan and Stowage Plan Message)**
- UN/EDIFACT message containing detailed container stowage plan
- Sent from carrier to port/terminal with container positions on vessel
- XML/EDI format with container number, commodity, weight, hazmat info

**COPARN (Container Pre-Announcement Message)**
- Advance notice of containers arriving at port
- Sent 24-48 hours before vessel arrival
- Contains: container ID, booking reference, shipper, consignee, commodity

**IFTMIN (Intermodal Transport Dangerous Goods)**
- Message format for dangerous goods information in container transport
- References: UN class, proper shipping name, technical name, marine pollutant flag

**CUSCAR (Customs Cargo Report Message)**
- Electronic customs manifest submission
- Contains: cargo description, container details, shipper/consignee, weight, HS codes
- Required by customs authority before vessel arrival

## Entity Definitions & Relationships

### Vessel
**Table:** `vessels`
- `id` (UUID primary key)
- `imo_number` (International Maritime Organization number, unique)
- `name` (vessel name)
- `vessel_type` (Container Ship, General Cargo, RoRo, Breakbulk, Reefer)
- `capacity_teu` (total TEU capacity)
- `length_m`, `breadth_m`, `draft_m` (dimensions)
- `built_year`, `age_years`
- `flag` (flag state, e.g., Panama, Liberia)
- `owner_id` (FK to company)
- `operator_id` (FK to company)
- `status` (Active, Inactive, Laid-Up, Under-Repair)
- `created_at`, `updated_at`, `deleted_at`

### Voyage
**Table:** `voyages`
- `id` (UUID)
- `vessel_id` (FK)
- `voyage_number` (e.g., "W001", "E002")
- `departure_port_id` (FK to ports)
- `departure_date` (planned)
- `arrival_date` (ETA)
- `status` (Planned, In-Transit, Arrived, Discharged, Closed)
- `total_containers` (count)
- `total_teu` (TEU volume)
- `revenue_usd` (sum of booking revenues)
- `created_at`, `updated_at`

### Booking
**Table:** `bookings`
- `id` (UUID)
- `voyage_id` (FK)
- `shipper_id` (FK to customers)
- `consignee_id` (FK to customers)
- `booking_reference` (external reference, e.g., "OOCL202601234")
- `container_count` (20ft, 40ft counts)
- `container_type` (DC, HC, OT, FR, Tank, Reefer)
- `commodity_hs_code` (Harmonized System code)
- `commodity_description`
- `total_weight_kg`, `total_volume_cbm`
- `status` (Pending, Confirmed, Loaded, Discharged, Closed, Cancelled)
- `rate_per_teu_usd`
- `revenue_usd` (container_count * rate)
- `currency` (USD, EUR, AED, INR, SGD)
- `created_at`, `updated_at`

### Container
**Table:** `containers`
- `id` (UUID)
- `container_number` (ISO identifier, e.g., "OOCL1234567")
- `container_type` (20DC, 40HC, 40OT, 20RFR)
- `size_feet` (20 or 40)
- `booking_id` (FK)
- `voyage_id` (FK)
- `status` (Empty, Loaded, In-Transit, At-Port, Damaged, Scrapped)
- `weight_kg`, `volume_cbm`
- `hazmat_flag` (true if dangerous goods)
- `commodity_description`
- `shipper_id`, `consignee_id` (FKs)
- `last_known_port_id` (FK, from vessel tracking)
- `created_at`, `updated_at`

### Port
**Table:** `ports`
- `id` (UUID)
- `port_code` (UNLOCODE, e.g., "AEDXB" for Dubai)
- `name` (port name)
- `country` (ISO country code)
- `latitude`, `longitude`
- `region` (Gulf, South Asia, Southeast Asia, etc.)
- `created_at`, `updated_at`

### Port Call
**Table:** `port_calls`
- `id` (UUID)
- `voyage_id` (FK)
- `port_id` (FK)
- `port_sequence` (1, 2, 3... order in voyage)
- `berth_id` (FK, assigned berth)
- `eta_date` (estimated arrival)
- `eta_time`
- `ata_date` (actual arrival, filled when vessel arrives)
- `etd_date` (estimated departure)
- `atd_date` (actual departure)
- `operation_type` (Load, Discharge, Both)
- `containers_to_load`, `containers_to_discharge`
- `status` (Planned, In-Progress, Completed)
- `created_at`, `updated_at`

### Berth
**Table:** `berths`
- `id` (UUID)
- `port_id` (FK)
- `berth_code` (e.g., "B01", "B02")
- `berth_name`
- `max_vessel_length_m`
- `max_draft_m`
- `container_rate_per_hour` (handling capacity)
- `status` (Available, Under-Maintenance)
- `created_at`, `updated_at`

### Bill of Lading
**Table:** `bills_of_lading`
- `id` (UUID)
- `booking_id` (FK)
- `bl_number` (carrier-issued, unique per voyage)
- `shipper_id`, `consignee_id`, `notify_party_id` (FKs)
- `vessel_id`, `voyage_id` (FKs)
- `port_of_loading_id`, `port_of_discharge_id` (FKs)
- `container_count`, `container_details` (JSON)
- `commodity_description`
- `total_weight_kg`, `total_volume_cbm`
- `status` (Draft, Issued, Released, Delivered, Cancelled)
- `issue_date`, `signed_date`
- `freight_usd`, `freight_currency`
- `created_at`, `updated_at`

## Status Code Enums

### Voyage Status
```
PLANNED, IN_TRANSIT, ARRIVED, DISCHARGED, CLOSED
```

### Booking Status
```
PENDING, CONFIRMED, LOADED, DISCHARGED, CLOSED, CANCELLED
```

### Container Status
```
EMPTY, LOADED, IN_TRANSIT, AT_PORT, DAMAGED, SCRAPPED
```

### Bill of Lading Status
```
DRAFT, ISSUED, RELEASED, DELIVERED, CANCELLED
```

### Port Call Status
```
PLANNED, IN_PROGRESS, COMPLETED
```

### Vessel Status
```
ACTIVE, INACTIVE, LAID_UP, UNDER_REPAIR
```

## Key Relationships

- Vessel (1) → (N) Voyage, Bunker Records, Crew Assignments
- Voyage (1) → (N) Bookings, Port Calls, Containers, Bills of Lading
- Booking (1) → (N) Containers, (1) Bill of Lading
- Port Call (1) → (1) Port, (1) Berth
- Customer (1) → (N) Bookings, (N) Containers

## Notes

- All monetary values in lowest currency unit (cents for USD) as integers
- All timestamps in UTC (timestamptz in PostgreSQL)
- Container numbers validated against ISO 6346 check digit
- All tables include `tenant_id` for multi-tenancy isolation
