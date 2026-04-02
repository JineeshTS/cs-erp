/** Layman-friendly explanations for each operational process. */
export const PROCESS_EXPLANATIONS: Record<string, string> = {
  // ── A. SALES & CUSTOMER MANAGEMENT (PRC-001 to PRC-020) ──

  "PRC-001":
    "Lead Capture automatically collects potential customer inquiries from your website, emails, and trade show contacts into one place. This matters because shipping companies can lose business if leads slip through the cracks. The system uses AI to pull in contact details and cargo requirements, then a sales rep reviews and follows up. Sales and marketing teams use this daily to keep the pipeline full.",

  "PRC-002":
    "Lead Scoring uses AI to rank each potential customer by how valuable and likely they are to become a paying client. This helps the sales team focus their time on the most promising opportunities instead of chasing every inquiry equally. The AI analyzes factors like cargo volume, trade lanes, and company size to assign a score. Sales managers review the ranked list to decide where to direct their team's efforts.",

  "PRC-003":
    "Opportunity Qualification checks whether a potential deal is actually feasible before the team invests more time. It verifies things like whether the company serves the required trade lanes, has the right container types, and can meet the customer's timeline. The system flags issues automatically, but a sales manager makes the final go/no-go call. This prevents wasted effort on deals that were never going to work out.",

  "PRC-004":
    "Quote Generation creates freight rate quotations for customers based on the cargo details, route, and current market rates. In shipping, getting accurate quotes out quickly can mean the difference between winning and losing a booking. The system pulls in current rates, surcharges, and transit times to build a professional quote. Sales reps review the generated quote and send it to the customer.",

  "PRC-005":
    "Contract Management handles the lifecycle of customer contracts, from initial creation through renewals and amendments. Shipping contracts can be complex, covering multiple trade lanes, volume commitments, and special rate agreements. The system tracks expiration dates and sends renewal reminders so revenue is not lost. Commercial managers and legal teams work together to manage these agreements.",

  "PRC-006":
    "Customer Onboarding sets up new customer accounts with all the information needed to start shipping. This includes collecting company details, trade preferences, billing information, and any special requirements. The system creates the customer profile and walks the operations team through each setup step. Customer service and operations staff handle this to ensure a smooth first experience.",

  "PRC-007":
    "Customer Credit Assessment evaluates whether a new or existing customer is financially reliable enough to be extended credit terms. In shipping, invoices can be large, so extending credit without proper checks can lead to significant losses. The system analyzes financial data and payment history to recommend a credit limit. The finance team reviews the AI recommendation and approves or adjusts the credit terms.",

  "PRC-008":
    "Customer Communication manages automated messages sent to customers about their shipments, invoices, and account updates. Keeping customers informed reduces the number of status inquiry calls and builds trust. The system sends notifications at key milestones like booking confirmation, vessel departure, and arrival. Customer service teams configure the rules, and the system handles the rest automatically.",

  "PRC-009":
    "Territory Management assigns geographic regions or trade lanes to specific sales representatives. This ensures every market is covered and prevents two salespeople from competing for the same customer. The system maps accounts to territories and tracks performance by region. Sales managers set up and adjust territories based on business strategy.",

  "PRC-010":
    "Sales Forecasting uses historical booking data and market trends to predict future cargo volumes and revenue. Accurate forecasts help the company plan vessel capacity, staffing, and cash flow. AI models analyze seasonal patterns, customer pipelines, and economic indicators to generate projections. Sales leadership reviews these forecasts for budgeting and strategic planning.",

  "PRC-011":
    "Customer Segmentation groups customers into categories based on their shipping behavior, volume, profitability, and trade lane preferences. This helps the company tailor its services, pricing, and communication for different customer types. AI analyzes transaction history to create meaningful segments automatically. Marketing and sales teams use these segments to run targeted campaigns and set pricing strategies.",

  "PRC-012":
    "Revenue Tracking monitors how much money is coming in from each customer, trade lane, and service. Shipping companies need to know where their revenue is growing and where it is declining. The system consolidates data from bookings, invoices, and payments into real-time dashboards. Finance and commercial teams review these reports to make informed business decisions.",

  "PRC-013":
    "Win/Loss Analysis examines why the company won or lost specific deals and customer bids. Understanding these patterns helps improve pricing, service offerings, and sales tactics. The system collects feedback from sales reps and customers, then AI identifies common themes. Sales managers use the insights to coach their teams and adjust strategy.",

  "PRC-014":
    "Account Health Monitoring tracks the overall status of each customer relationship by watching booking trends, payment behavior, and communication patterns. Early warning signs like declining volumes or late payments can indicate a customer is about to leave. The system uses AI to calculate a health score and flag at-risk accounts. Account managers receive alerts so they can intervene before losing the customer.",

  "PRC-015":
    "Customer Feedback Analysis collects and analyzes satisfaction surveys, complaints, and compliments from customers. Understanding what customers think about the service helps the company improve. AI reads through feedback responses and identifies recurring themes and sentiment trends. The quality and customer service teams use these insights to prioritize improvements.",

  "PRC-016":
    "Service Quality Monitoring tracks whether the company is delivering on its promises, such as on-time departures, transit times, and cargo condition. Service failures in shipping can lead to customer losses and penalty charges. The system automatically compares actual performance against agreed standards. Operations and quality managers review the metrics to identify and fix recurring issues.",

  "PRC-017":
    "Customer Retention predicts which customers are at risk of leaving and recommends actions to keep them. Losing a large shipping customer can mean millions in lost revenue. AI analyzes booking frequency, complaint history, and market activity to calculate churn risk scores. Account managers receive specific retention recommendations like rate adjustments or service improvements.",

  "PRC-018":
    "Customer Self-Service provides an AI-powered chatbot and portal where customers can check shipment status, download documents, and get answers to common questions without calling the office. This reduces the workload on customer service staff and gives customers instant access to information. The chatbot handles routine queries while complex issues are escalated to human agents. IT and customer service teams maintain the system.",

  "PRC-019":
    "Market Rate Benchmarking compares the company's freight rates against current market rates and competitor pricing. Setting rates too high loses customers, while setting them too low cuts into profits. The system gathers market rate data from indices and trade publications to show where the company stands. Pricing and commercial teams use this to adjust rates and stay competitive.",

  "PRC-020":
    "Pipeline Reporting generates visual reports showing all active sales opportunities, their stages, and expected revenue. Sales leadership needs a clear view of what deals are in progress and what revenue to expect. The system automatically pulls data from the CRM and presents it in dashboards with filters by region, trade lane, and salesperson. Sales managers review these reports in weekly pipeline meetings.",

  // ── B. BOOKING & DOCUMENTATION (PRC-021 to PRC-040) ──

  "PRC-021":
    "Booking Request Validation checks every incoming cargo booking to make sure the details are complete and correct before accepting it. Catching errors early prevents costly problems later, like containers arriving at the wrong port or cargo not fitting the vessel. The system automatically validates cargo weight, dimensions, hazmat codes, and vessel availability. Operations staff review any bookings that fail validation checks.",

  "PRC-022":
    "Space Allocation assigns available vessel space to confirmed bookings based on priority, contract commitments, and cargo type. Vessels have limited capacity, so smart allocation maximizes revenue and ensures important customers get space. The system considers weight limits, container slots, and dangerous goods restrictions when allocating. Vessel planners and booking teams work together to manage space.",

  "PRC-023":
    "Container Assignment matches the right container type and size to each booking based on cargo requirements. Using the wrong container can damage cargo or waste money on unnecessary equipment. The system checks container availability, condition, and location to make the best assignment. Equipment controllers handle assignments, with the system suggesting optimal matches.",

  "PRC-024":
    "Shipping Instruction Processing takes the detailed shipping instructions from customers and converts them into the information needed for transport documents. Getting these details right is critical because errors on a Bill of Lading can cause customs delays or legal issues. The system validates the instructions against the booking and flags discrepancies. Documentation staff process the instructions and resolve any issues with the shipper.",

  "PRC-025":
    "Bill of Lading Generation creates the Bill of Lading, which is the most important document in shipping. The B/L serves as a receipt for the cargo, a contract of carriage, and a document of title. The system pulls data from the booking and shipping instructions to draft the B/L, then a documentation clerk reviews it for accuracy. Errors on a B/L can delay cargo release or create legal liability.",

  "PRC-026":
    "Manifest Compilation assembles the complete list of all cargo being loaded or discharged at each port into an official manifest. Customs authorities require this document before a vessel can arrive or depart. The system aggregates data from all bookings on a voyage and formats it according to each country's requirements. Documentation teams compile and submit the manifest to port authorities.",

  "PRC-027":
    "Customs Documentation prepares the declarations and paperwork required by customs authorities in the origin and destination countries. Without proper customs documentation, cargo gets held at the border, costing time and money. The system auto-fills customs forms using booking and cargo data, applying country-specific rules. Customs brokers and documentation staff review and submit the declarations.",

  "PRC-028":
    "Certificate of Origin Processing handles the certificates that prove where goods were manufactured, which affects tariff rates and trade agreements. Many countries require these certificates before allowing goods to be imported. The system helps prepare the application and tracks the approval process with chambers of commerce. Documentation staff coordinate with shippers to gather the required information.",

  "PRC-029":
    "Dangerous Goods Declaration manages the special documentation required when shipping hazardous materials like chemicals, batteries, or flammable goods. Strict international rules govern how dangerous cargo must be declared, packed, and labeled. The system validates DG declarations against IMDG Code requirements and checks for incompatible cargo combinations. Trained DG specialists review every declaration before the cargo is accepted.",

  "PRC-030":
    "VGM Processing handles Verified Gross Mass submissions, which are mandatory weight declarations for every packed container. Since 2016, international law requires shippers to verify the actual weight of containers before loading. The system receives VGM data from shippers, validates it against booking details, and submits it to the terminal. Operations staff monitor submissions and follow up on missing or questionable VGM data.",

  "PRC-031":
    "Amendment Processing handles requests to change information on Bills of Lading after they have been issued. Changes are common in shipping but must be carefully controlled because the B/L is a legal document. The system tracks each amendment request, validates the changes, and creates an audit trail. Documentation staff process amendments and charge applicable fees.",

  "PRC-032":
    "Cargo Release Order generates the document that authorizes a terminal or warehouse to release cargo to the consignee. Cargo cannot be picked up without this authorization, so timely processing prevents delivery delays. The system checks that all charges are paid and documents are in order before issuing the release. Import operations staff issue release orders after verifying payment and documentation.",

  "PRC-033":
    "Freight Collect Processing handles shipments where the freight charges are paid by the receiver at the destination rather than the shipper at origin. This requires coordination between origin and destination offices to ensure charges are collected. The system tracks collect freight amounts, manages credit approvals, and ensures destination billing happens. Finance and operations teams at both ends coordinate the process.",

  "PRC-034":
    "Telex Release enables electronic surrender of the original Bill of Lading so the consignee can collect cargo without presenting the physical paper document. This speeds up cargo release because paper documents do not need to be couriered across the world. The system sends an electronic release message to the destination office after verifying the original B/L is surrendered. Documentation staff at origin and destination coordinate the telex release.",

  "PRC-035":
    "Switch B/L Processing handles situations where a new Bill of Lading is issued to replace the original one, often to change the shipper, consignee, or other details for trade intermediaries. This is common in commodity trading where cargo changes hands during transit. The system manages the surrender of the original B/L and issuance of the switch B/L with proper authorization. Senior documentation staff handle these carefully due to the fraud risk involved.",

  "PRC-036":
    "Sea Waybill Generation creates a non-negotiable transport document used when a Bill of Lading's title function is not needed. Sea waybills speed up cargo release because the named consignee can collect cargo with just identification, no paper document required. The system generates the sea waybill from booking data similar to a B/L but without the negotiability features. Documentation staff issue these when requested by customers.",

  "PRC-037":
    "Express Release provides an expedited process for releasing cargo at the destination, often used when shipment timing is critical. This combines faster document processing with priority communication between origin and destination offices. The system fast-tracks the release authorization and notifies all parties immediately. Operations staff prioritize these shipments to minimize customer waiting time.",

  "PRC-038":
    "Document Verification uses AI to check all shipping documents for completeness, consistency, and compliance with regulations. Errors in shipping documents can cause customs holds, fines, or cargo abandonment. The system cross-references data across the booking, B/L, manifest, and customs forms to find discrepancies. Documentation supervisors review flagged issues and ensure corrections are made before submission.",

  "PRC-039":
    "HS Code Classification helps assign the correct Harmonized System codes to cargo, which determines customs duties and trade regulations. Misclassification can lead to penalties, cargo seizure, or incorrect duty payments. AI suggests HS codes based on cargo descriptions and past classifications, but a trained specialist confirms the selection. Customs and documentation teams use this for every shipment.",

  "PRC-040":
    "Trade Compliance Screening checks every shipment against sanctions lists, embargo restrictions, and denied party databases. Shipping companies face severe penalties and criminal liability for transporting goods to or from sanctioned entities. The system automatically screens all parties in a transaction and flags potential matches. Compliance officers investigate every alert and make the final determination on whether to proceed.",

  // ── C. VESSEL & VOYAGE OPERATIONS (PRC-041 to PRC-060) ──

  "PRC-041":
    "Voyage Planning creates the detailed plan for each vessel voyage, including route, port calls, speed profile, and fuel requirements. Good voyage planning directly impacts profitability by optimizing fuel costs and maximizing cargo intake. AI helps select the most efficient route considering weather, currents, and canal transits. Fleet managers and voyage planners collaborate to finalize each voyage plan.",

  "PRC-042":
    "Port Rotation Scheduling determines the sequence of ports a vessel will visit on each service loop. The order of port calls affects transit times, cargo connections, and operational efficiency. The system evaluates cargo demand, port productivity, and tidal windows to optimize the rotation. Network planners design rotations that balance customer needs with operational costs.",

  "PRC-043":
    "ETA Prediction uses AI and real-time vessel tracking to predict when a ship will arrive at its next port. Accurate arrival predictions help terminals plan crane operations and help customers plan cargo collection. The system factors in weather, currents, port congestion, and vessel speed to continuously update the ETA. Operations teams and customers both rely on these predictions for planning.",

  "PRC-044":
    "Capacity Forecasting predicts how much space will be available on upcoming voyages based on current bookings and historical patterns. Knowing future capacity helps the sales team sell remaining space and helps operations plan equipment. AI analyzes booking trends, seasonal patterns, and market conditions to forecast availability. Commercial and operations teams use forecasts to maximize vessel utilization.",

  "PRC-045":
    "Stowage Planning decides where each container should be placed on the vessel, considering weight distribution, stability, dangerous goods separation, and discharge port sequence. Poor stowage can make a vessel unstable, require extra crane moves at port, or violate safety rules. The system generates an optimized stowage plan that the vessel planner reviews. Stowage planners and ship officers work together to ensure safe and efficient loading.",

  "PRC-046":
    "Bay Plan Generation creates the detailed visual diagram showing exactly where every container sits on the vessel, bay by bay, row by row, and tier by tier. Terminals need this plan to know how to load and discharge containers efficiently. The system automatically generates the bay plan from the stowage plan and updates it as changes occur. Vessel planners maintain the bay plan and share it with terminals.",

  "PRC-047":
    "Load/Discharge Sequencing determines the optimal order for loading and unloading containers at each port. The right sequence minimizes unnecessary crane moves, called restows, which waste time and money. The system considers discharge ports, container weights, and dangerous goods positions to create the sequence. Terminal planners and vessel planners coordinate to execute the sequence efficiently.",

  "PRC-048":
    "Vessel Performance Monitoring tracks key metrics like vessel speed, fuel consumption, engine performance, and cargo intake in real time. Understanding how each vessel is performing helps identify mechanical issues early and optimize operations. The system collects data from onboard sensors and compares it against benchmarks. Fleet managers and technical superintendents monitor these dashboards daily.",

  "PRC-049":
    "Fuel Consumption Optimization uses AI to find ways to reduce fuel usage, which is typically a shipping company's largest operating cost. Even small improvements in fuel efficiency can save millions of dollars per year across a fleet. The system analyzes weather, currents, hull condition, and engine performance to recommend optimal settings. Fleet managers and ship officers implement the recommended adjustments.",

  "PRC-050":
    "Noon Report Processing handles the daily position and performance reports that every vessel sends to shore management at noon. These reports contain critical data on fuel consumption, weather, cargo condition, and vessel position. The system automatically parses incoming reports, validates the data, and updates voyage tracking. Fleet operations staff review noon reports to monitor vessel progress and flag anomalies.",

  "PRC-051":
    "Port Cost Estimation calculates the expected costs for each port call, including port dues, pilotage, tug fees, terminal charges, and agency fees. These costs can vary dramatically by port and significantly impact voyage profitability. The system uses historical data and current tariffs to estimate costs before the vessel arrives. Voyage accountants and operations managers review estimates to catch unexpected charges.",

  "PRC-052":
    "Voyage P&L Calculation determines the profit or loss for each individual voyage by comparing revenue against all costs. This is how shipping companies know which voyages and trade lanes are making money. The system aggregates freight revenue, bunker costs, port costs, and overhead to calculate the result. Finance and commercial teams analyze voyage P&L to guide strategic decisions.",

  "PRC-053":
    "Speed Optimization finds the ideal vessel speed that balances fuel cost savings against schedule requirements. Slower speeds save fuel but may cause late arrivals, while faster speeds waste fuel but maintain schedule reliability. AI calculates the optimal speed profile for each voyage leg considering weather, port schedules, and fuel prices. Fleet managers and ship captains use these recommendations to set vessel speed.",

  "PRC-054":
    "Weather Routing adjusts vessel routes in real time based on weather forecasts to avoid storms, heavy seas, and unfavorable currents. Bad weather can damage cargo, endanger the crew, and waste fuel. The system monitors weather data from multiple sources and suggests route alternatives when conditions deteriorate. Ship captains and fleet operations decide whether to follow the recommended deviations.",

  "PRC-055":
    "Canal Transit Planning manages the complex logistics of transiting the Suez Canal, Panama Canal, or other major waterways. Canal transits involve booking slots, managing convoy schedules, calculating tolls, and meeting specific vessel requirements. The system handles reservation timing, documentation, and cost estimation for each transit. Operations planners and canal agents coordinate to ensure smooth passage.",

  "PRC-056":
    "Voyage Closure finalizes all the accounting and documentation for a completed voyage. This includes reconciling all revenue and costs, closing out pending invoices, and generating the final voyage result. The system checks for any missing charges or unbilled items before closing. Finance and operations staff work together to close voyages promptly so the company has accurate financial data.",

  "PRC-057":
    "Bunker Planning determines when, where, and how much fuel to purchase for each vessel. Fuel is the biggest operating cost for a shipping company, so buying at the right price and location matters enormously. The system considers fuel prices at different ports, vessel consumption rates, and tank capacity to recommend optimal bunkering. Bunker traders and fleet managers make purchasing decisions based on these recommendations.",

  "PRC-058":
    "Port Agency Coordination manages communication and task coordination with port agents at every port of call. Port agents are the company's local representatives who handle vessel arrival formalities, documentation, and services. The system sends voyage details and instructions to agents and tracks their task completion. Operations staff coordinate with agents to ensure all port call requirements are met.",

  "PRC-059":
    "Vessel Schedule Publication creates and distributes the official sailing schedules that customers use to plan their shipments. Accurate, up-to-date schedules are essential for customer confidence and booking decisions. The system compiles schedules from voyage plans and publishes them to the website, booking platforms, and partner systems. Schedule coordinators update and publish schedules, noting any changes or cancellations.",

  "PRC-060":
    "Proforma Voyage Estimate creates a financial projection for a proposed voyage before committing to it. This helps management decide whether a new service or extra voyage is worth operating. The system estimates revenue based on expected cargo volumes and costs based on fuel, port charges, and operational expenses. Commercial and operations leadership review proformas to make go/no-go decisions.",

  // ── D. EQUIPMENT & CONTAINER (PRC-061 to PRC-080) ──

  "PRC-061":
    "Container Inventory Tracking maintains a real-time count of every container the company owns or leases, sorted by type, size, location, and status. Knowing exactly where containers are and their condition is fundamental to container shipping operations. The system updates automatically as containers move through gates, terminals, and vessels. Equipment controllers monitor inventory levels to ensure adequate supply.",

  "PRC-062":
    "Container Positioning manages the strategic placement of empty containers at locations where they will be needed for future bookings. Having containers in the right place avoids costly last-minute repositioning and prevents lost bookings due to equipment shortages. AI analyzes booking forecasts and historical patterns to recommend where to pre-position empties. Equipment managers decide on positioning moves based on these recommendations.",

  "PRC-063":
    "Container Release authorizes the release of empty containers to customers for loading. The release instruction tells the depot or terminal which containers a specific customer is allowed to pick up. The system generates release references after verifying the booking is confirmed and the customer's credit is clear. Equipment controllers issue releases, and depot staff verify them at pickup.",

  "PRC-064":
    "Gate-In Processing handles the administrative and inspection steps when a container arrives at a terminal or depot. Every container entering a facility must be identified, inspected for damage, and its arrival recorded. The system captures container numbers, seal numbers, and damage photos, then updates the inventory. Gate clerks and inspectors at the terminal handle the physical checks.",

  "PRC-065":
    "Gate-Out Processing manages the steps when a container leaves a terminal or depot, whether it is being loaded onto a truck for delivery or picked up as an empty. The system verifies that the container is authorized for release and records the departure details. Gate-out data updates container tracking and triggers billing events. Gate clerks verify documentation and authorize departures.",

  "PRC-066":
    "Container Inspection provides a structured process for checking the physical condition of containers at various points in their journey. Regular inspections catch damage early, prevent unsafe containers from being used, and support insurance claims. The system guides inspectors through a checklist and records findings with photos. Trained container inspectors perform the checks at depots and terminals.",

  "PRC-067":
    "Repair Authorization manages the approval process for container repairs, including cost estimates and vendor selection. Containers get damaged during transport and need repairs to stay in service, but unauthorized repairs waste money. The system evaluates damage reports, estimates repair costs, and routes approvals based on cost thresholds. Equipment managers approve repairs and track spending against budgets.",

  "PRC-068":
    "Container Maintenance schedules preventive maintenance for the container fleet to extend container life and prevent failures. Regular maintenance like floor repairs, painting, and seal replacement keeps containers cargo-worthy. The system tracks maintenance history and schedules upcoming work based on container age and condition. Maintenance managers at depots plan and execute the maintenance program.",

  "PRC-069":
    "Container Damage Assessment evaluates and documents damage found on containers, determining the cause, responsible party, and repair requirements. Proper damage assessment is essential for recovering costs from responsible parties and maintaining fleet quality. The system uses photos and inspector reports to classify damage and estimate repair costs. Trained surveyors assess damage and assign liability.",

  "PRC-070":
    "Reefer Temperature Monitoring continuously tracks the temperature inside refrigerated containers carrying perishable or temperature-sensitive cargo. Even brief temperature excursions can spoil an entire container of food, pharmaceuticals, or chemicals. The system receives temperature data from container sensors and alerts staff if readings go out of range. Reefer technicians and operations staff respond to temperature alarms around the clock.",

  "PRC-071":
    "Reefer PTI manages pre-trip inspections for refrigerated containers before they are released to customers. A PTI verifies that the reefer unit is working correctly and can maintain the required temperature during the voyage. The system schedules PTIs, records results, and flags units that fail inspection. Reefer technicians perform the physical inspections and repairs at depots.",

  "PRC-072":
    "Empty Repositioning plans and executes the movement of empty containers from locations with surplus to locations with demand. Repositioning empties is a major cost for shipping companies, so optimizing these moves saves significant money. AI analyzes trade imbalances and forecast demand to find the cheapest repositioning options. Equipment managers and network planners decide on repositioning strategies.",

  "PRC-073":
    "Container Leasing Management handles the administration of containers leased from third-party leasing companies. Many shipping companies lease a portion of their container fleet to maintain flexibility without the full capital cost of ownership. The system tracks lease terms, billing, on-hire and off-hire events, and renewal dates. Equipment managers and finance staff manage leasing agreements and costs.",

  "PRC-074":
    "Container Surveys manages the formal on-hire and off-hire inspections performed when containers are picked up from or returned to leasing companies. These surveys establish the container's condition at handover, which determines who pays for any damage. The system records survey findings and tracks disputes with lessors. Surveyors perform physical inspections, and equipment managers resolve any disputes.",

  "PRC-075":
    "Container Tracking provides real-time location and status information for every container in the fleet. Customers expect to know where their cargo is at all times, and operations need tracking data for planning. The system combines GPS data, terminal events, and vessel tracking to maintain current container positions. Operations staff and customers access tracking information through dashboards and the customer portal.",

  "PRC-076":
    "OOG Cargo Planning handles the special arrangements needed for out-of-gauge cargo that exceeds standard container dimensions, such as heavy machinery or tall equipment. OOG cargo requires special equipment like flat racks or open tops, and careful stowage planning to avoid interfering with adjacent containers. The system calculates space requirements and identifies suitable vessel positions. Special cargo coordinators and stowage planners handle OOG bookings.",

  "PRC-077":
    "Container Cleaning schedules and tracks the cleaning of containers between uses, especially when cargo residues need removal. Clean containers prevent contamination between shipments and maintain cargo quality. The system assigns cleaning based on previous cargo type and the next booking's requirements. Depot staff perform cleaning, and equipment controllers track completion.",

  "PRC-078":
    "Tank Container Management handles the specialized operations for ISO tank containers used to transport liquids and gases. Tank containers have unique requirements for cleaning, testing, certification, and hazmat compliance. The system tracks tank certifications, cleaning records, and cargo compatibility. Specialized tank container operators manage this equipment with extra attention to safety regulations.",

  "PRC-079":
    "Container Fleet Analysis provides analytical reports on how effectively the container fleet is being used. Understanding fleet performance helps optimize the fleet size and mix, reducing costs while meeting customer demand. The system calculates metrics like utilization rates, idle time, repositioning ratios, and maintenance costs. Equipment managers and fleet strategists use these insights for planning.",

  "PRC-080":
    "Container Lifecycle Management tracks each container from purchase or lease through its entire service life until disposal. This long-term view helps plan capital expenditure, maintenance budgets, and fleet renewal. The system records every significant event in a container's life including repairs, surveys, and relocations. Fleet management uses lifecycle data to decide when to repair, refurbish, or retire containers.",

  // ── E. PORT & TERMINAL (PRC-081 to PRC-100) ──

  "PRC-081":
    "Port Call Management coordinates all the activities involved when a vessel visits a port, from arrival preparations through departure. A port call involves dozens of tasks including customs clearance, cargo operations, bunkering, and crew changes. The system creates a timeline of all activities and tracks their completion. Port operations managers oversee port calls, coordinating between ship officers, terminal, and agents.",

  "PRC-082":
    "Berth Planning assigns berthing positions and time windows for vessels at the terminal. Getting the right berth at the right time affects how quickly cargo can be loaded and discharged. The system considers vessel size, draft restrictions, crane reach, and schedule requirements to optimize berth assignments. Terminal planners and vessel operators negotiate berth windows.",

  "PRC-083":
    "Pilot Booking arranges for maritime pilots to guide vessels safely into and out of port. Pilots are mandatory in most ports and must be booked in advance based on vessel arrival times. The system sends pilot requests to the port authority and tracks confirmations. Port operations staff manage pilot bookings as part of the port call preparation.",

  "PRC-084":
    "Tug Arrangement books tugboat assistance for large vessels that need help maneuvering in port waters. The number and power of tugs required depends on vessel size, weather conditions, and berth location. The system calculates tug requirements and sends booking requests to tug operators. Port operations staff coordinate tug arrangements with the port authority and tug companies.",

  "PRC-085":
    "Port Due Calculation computes all the charges a vessel owes for using port facilities, including harbor dues, light dues, mooring fees, and waste disposal charges. Port costs are a significant component of voyage expenses and vary widely between ports. The system applies each port's tariff schedule to the vessel's characteristics to calculate total dues. Finance and operations staff verify port cost invoices against the calculated amounts.",

  "PRC-086":
    "Terminal Handling Coordination manages the interaction between the shipping line and the container terminal during cargo operations. Smooth coordination ensures containers are loaded and discharged efficiently without delays. The system exchanges data with terminal operating systems about which containers to handle and in what order. Operations coordinators communicate with terminal staff to resolve any issues during operations.",

  "PRC-087":
    "Yard Planning organizes the layout and stacking of containers in the terminal yard to maximize space and minimize handling moves. Smart yard planning reduces the time it takes to find and move containers when they are needed. The system assigns yard positions based on vessel schedules, cargo type, and expected pickup times. Terminal yard planners manage container placement and retrieval.",

  "PRC-088":
    "Crane Assignment allocates quay cranes to vessels based on the volume of containers to handle and the required turnaround time. More cranes means faster operations but increases cost, so the balance must be right. The system considers vessel size, container count, and schedule pressure to recommend crane deployment. Terminal operations managers decide on crane assignments for each vessel call.",

  "PRC-089":
    "Vessel Turnaround Optimization works to minimize the total time a vessel spends in port, from arrival to departure. Less time in port means lower costs, better schedule adherence, and more productive use of expensive vessel assets. The system identifies bottlenecks in the port call process and suggests ways to speed up operations. Operations managers and terminal coordinators implement improvements.",

  "PRC-090":
    "Port Community System Integration connects the company's systems with the shared electronic platforms used by port communities. These systems facilitate information exchange between shipping lines, terminals, customs, and other port stakeholders. The system manages data flows for vessel notifications, customs declarations, and cargo releases. IT and operations teams maintain these integrations to keep data flowing smoothly.",

  "PRC-091":
    "Draft Survey Management handles the process of measuring a vessel's water displacement to determine the weight of cargo loaded or discharged. Draft surveys are used to verify bulk cargo weights and settle disputes about cargo quantities. The system records draft readings and calculates cargo weights using vessel hydrostatic data. Marine surveyors perform the measurements, and operations staff maintain the records.",

  "PRC-092":
    "Anchorage Management tracks vessels waiting at anchorage for berth availability, weather clearance, or other reasons. Time at anchorage costs money and delays the schedule, so managing it well is important. The system monitors anchorage queues and estimated wait times to help plan port operations. Port operations staff coordinate with port authorities to minimize anchorage time.",

  "PRC-093":
    "Port Performance Analytics analyzes how efficiently cargo operations are conducted at each port the company uses. Metrics like crane moves per hour, vessel turnaround time, and gate processing speed reveal which ports perform well and which need improvement. The system compiles data from port calls and generates comparative performance reports. Operations managers use these analytics to negotiate with terminals and optimize port selection.",

  "PRC-094":
    "Intermodal Connection Planning coordinates the rail and truck connections that move containers between the port and inland destinations. Missed connections mean cargo sits idle, increasing costs and delaying delivery. The system schedules inland transport to align with vessel arrivals and departures. Intermodal coordinators arrange trucking and rail services for the last mile of delivery.",

  "PRC-095":
    "Transshipment Planning manages cargo that needs to be transferred between vessels at a hub port to reach its final destination. Transshipment involves careful timing to ensure connecting vessel schedules align and cargo does not get stranded. The system tracks transshipment containers, identifies connection risks, and suggests alternatives when connections are at risk. Hub port operations teams manage the physical transshipment process.",

  "PRC-096":
    "CFS Operations Management oversees Container Freight Station operations where less-than-container-load cargo is consolidated or deconsolidated. CFS handling involves receiving loose cargo, stuffing it into containers, or unpacking containers for individual consignees. The system tracks individual cargo pieces through the CFS and manages the stuffing and stripping plans. CFS supervisors and warehouse staff handle the physical operations.",

  "PRC-097":
    "Port Security Compliance ensures the company meets International Ship and Port Facility Security Code requirements at every port. ISPS compliance is mandatory and involves security plans, drills, access controls, and documentation. The system tracks security level changes, maintains required records, and schedules security drills. The Company Security Officer and ship security officers manage compliance.",

  "PRC-098":
    "Environmental Port Compliance manages compliance with environmental regulations at ports, including waste disposal, ballast water, and emission rules. Violations can result in heavy fines, vessel detention, and reputational damage. The system tracks environmental requirements by port and ensures all necessary preparations are made before arrival. Environmental officers and ship officers work together to maintain compliance.",

  "PRC-099":
    "Port Congestion Management handles situations when ports become congested, causing delays to vessel schedules and cargo delivery. Congestion can be caused by weather, labor disputes, equipment failures, or cargo surges. The system monitors congestion indicators and helps operations teams make decisions about rerouting, waiting, or using alternative ports. Operations managers coordinate response actions during congestion events.",

  "PRC-100":
    "Free Zone Operations manages cargo moving through free trade zones, which have special customs and regulatory requirements. Free zones allow goods to be stored, processed, or re-exported without paying import duties. The system tracks cargo status within free zones and ensures compliance with zone regulations. Operations and documentation staff handle free zone procedures and documentation.",

  // ── F. TRADE ROUTE (PRC-101 to PRC-120) ──

  "PRC-101":
    "Trade Lane Performance Analysis examines how well each shipping route is performing in terms of volume, revenue, cost, and service quality. Understanding trade lane performance helps the company decide where to invest and where to cut back. The system compiles data from multiple sources to produce comprehensive trade lane scorecards. Commercial and operations leadership review these reports for strategic decision-making.",

  "PRC-102":
    "Service Loop Optimization fine-tunes the circular routes that vessels follow repeatedly, adjusting port calls, speed, and frequency to maximize efficiency. A well-optimized service loop reduces costs while maintaining competitive transit times. AI models simulate different loop configurations to find the best balance of cost and service. Network planners and commercial teams decide on loop changes based on these analyses.",

  "PRC-103":
    "Slot Agreement Management handles vessel sharing agreements where two or more shipping lines exchange space on each other's vessels. These agreements allow companies to offer wider network coverage without operating vessels on every route. The system tracks slot allocations, usage, and financial settlements between partners. Commercial and operations managers negotiate and manage slot agreements with partner lines.",

  "PRC-104":
    "Feeder Service Planning designs and manages the smaller vessel services that connect regional ports to main hub ports. Feeders extend the network reach by connecting ports too small for large mainline vessels. The system analyzes cargo demand, transit times, and costs to plan optimal feeder routes. Network planners design feeder services that balance coverage with profitability.",

  "PRC-105":
    "Hub Port Selection evaluates and selects the major ports that serve as transshipment hubs in the shipping network. The choice of hub ports affects transit times, costs, and service reliability for the entire network. The system compares ports on factors like geographic location, terminal productivity, cost, and connectivity. Network strategists make hub port decisions based on comprehensive analysis.",

  "PRC-106":
    "Network Design creates the overall shipping network layout, determining which trade lanes to serve, how many vessels to deploy, and how services connect. The network design is the most strategic operational decision a shipping company makes. AI models optimize network configurations against revenue potential, cost structures, and competitive positioning. Senior management and network planners collaborate on network design decisions.",

  "PRC-107":
    "Seasonal Capacity Adjustment modifies vessel deployment and service frequency to match predictable seasonal changes in cargo demand. Shipping volumes spike before holidays and slow down during certain seasons, so capacity must flex accordingly. The system analyzes historical patterns and forward bookings to recommend capacity changes. Operations and commercial teams implement seasonal adjustments like extra loaders or blank sailings.",

  "PRC-108":
    "Alliance Coordination manages the operational collaboration with partner shipping lines in vessel-sharing alliances. Alliance members share vessels and coordinate schedules to offer better coverage than any single line could alone. The system handles data exchange, schedule coordination, and operational communications with alliance partners. Alliance management teams and operations coordinators handle day-to-day coordination.",

  "PRC-109":
    "Blank Sailing Decision supports the decision to cancel a scheduled sailing, usually when cargo demand is too low to justify the voyage cost. Blank sailings save money but disappoint customers and damage schedule reliability. The system evaluates booking levels, cost projections, and contractual obligations to recommend whether to blank a sailing. Senior commercial and operations managers make blank sailing decisions.",

  "PRC-110":
    "Demand-Supply Matching aligns available vessel capacity with actual and forecasted cargo demand across the network. Imbalances between supply and demand affect pricing, utilization, and customer satisfaction. The system continuously monitors bookings against available space and highlights imbalances by trade lane. Commercial and operations teams adjust pricing and capacity allocation based on these insights.",

  "PRC-111":
    "Rate Filing submits freight tariff rates to regulatory authorities in markets where this is required by law. Some countries mandate that shipping lines file their rates with a government agency before they can be offered to customers. The system manages rate filings, tracks approval status, and ensures compliance with filing deadlines. Tariff and compliance teams handle rate filings for each regulated market.",

  "PRC-112":
    "Surcharge Management administers the various surcharges added to base freight rates, such as bunker adjustment factor, currency adjustment factor, and peak season surcharges. Surcharges help shipping lines recover variable costs that change frequently. The system calculates surcharge amounts based on fuel prices, exchange rates, and market conditions, and applies them to invoices. Pricing teams set surcharge levels and the system applies them automatically.",

  "PRC-113":
    "Demurrage Calculation computes the charges owed when a container is kept at the port or terminal beyond the allowed free time. Demurrage encourages timely pickup and returns, keeping equipment flowing through the supply chain. The system tracks container dwell times, applies the tariff rates, and generates demurrage invoices. Finance and equipment teams manage demurrage billing and dispute resolution.",

  "PRC-114":
    "Detention Monitoring tracks how long customers keep containers at their premises beyond the agreed free time period. Excessive detention ties up equipment that other customers need and reduces fleet availability. The system monitors container status updates and alerts staff when free time is about to expire. Equipment controllers follow up with customers and the system calculates detention charges.",

  "PRC-115":
    "Free Time Management sets and applies the rules for how many days a customer can use a container at port or inland without incurring demurrage or detention charges. Free time is a competitive tool, with larger customers often receiving more favorable terms. The system maintains free time rules by customer, trade lane, and location, applying them automatically to each shipment. Commercial and equipment teams set free time policies.",

  "PRC-116":
    "Port Tariff Management maintains and applies the specific tariff rates for services at each port, including terminal handling charges, storage fees, and special equipment charges. Port tariffs change frequently and vary significantly between locations. The system keeps an up-to-date database of port tariffs and applies the correct charges to each shipment. Pricing and operations teams maintain the tariff database.",

  "PRC-117":
    "Competitor Rate Analysis gathers and analyzes freight rates offered by competing shipping lines on the same trade lanes. Understanding competitor pricing helps the company set rates that are competitive without sacrificing profitability. The system collects rate intelligence from market sources and compares it against the company's own rates. Commercial and pricing teams use this analysis to adjust their rate strategy.",

  "PRC-118":
    "Market Share Tracking monitors the company's share of total container volumes on each trade lane over time. Gaining or losing market share indicates whether the commercial strategy is working. The system compiles industry data and internal volumes to calculate market share trends. Senior commercial managers track market share as a key performance indicator.",

  "PRC-119":
    "Cargo Mix Optimization analyzes and improves the composition of cargo types carried to maximize revenue per vessel. Different cargo types generate different revenue, so the right mix of high-paying and volume cargo maximizes profitability. AI evaluates booking requests against revenue targets to recommend the optimal cargo mix. Commercial and pricing teams use cargo mix analysis to set booking priorities.",

  "PRC-120":
    "Revenue Management uses dynamic pricing techniques to maximize total revenue from available vessel capacity. Like airline yield management, shipping revenue management adjusts prices based on demand, timing, and remaining capacity. AI models recommend rate adjustments based on booking pace, competitor activity, and market conditions. Revenue managers review and implement pricing recommendations across trade lanes.",

  // ── G. FINANCIAL (PRC-121 to PRC-140) ──

  "PRC-121":
    "Invoice Generation creates freight invoices for customers based on completed shipments, applying the correct rates, surcharges, and charges. Accurate and timely invoicing is essential for cash flow and customer satisfaction. The system automatically compiles charges from the booking, tariffs, and additional services into a professional invoice. Finance staff review generated invoices before they are sent to customers.",

  "PRC-122":
    "Credit Note Processing creates credit notes when customers are owed a refund or adjustment on a previous invoice. This happens when charges were incorrect, services were not delivered, or commercial adjustments are agreed. The system ensures proper approval workflows and links credit notes to the original invoices. Finance staff process credit notes with appropriate authorization from commercial managers.",

  "PRC-123":
    "Debit Note Processing creates debit notes for additional charges not included on the original invoice, such as demurrage, detention, or amendment fees. These charges arise after the initial invoice and need separate documentation. The system generates debit notes with clear references to the original shipment and reason for the charge. Finance staff issue debit notes and track their collection.",

  "PRC-124":
    "Payment Application matches incoming customer payments to the correct invoices and updates the accounts receivable ledger. In shipping, customers often pay multiple invoices in a single payment, making matching complex. The system uses AI to suggest which invoices a payment should be applied to based on amounts and references. Accounts receivable staff review and confirm payment applications.",

  "PRC-125":
    "Dunning Process sends automated payment reminders to customers with overdue invoices, escalating the tone and urgency based on how late the payment is. Consistent follow-up on overdue payments improves cash collection without straining customer relationships. The system schedules reminder emails at configured intervals and escalates to phone calls for very late payments. Credit control staff manage the dunning process and handle customer responses.",

  "PRC-126":
    "Credit Limit Monitoring continuously watches customer credit balances against their approved credit limits. When a customer approaches or exceeds their limit, new bookings may need to be held until payment is received. The system alerts credit control when limits are near or exceeded and can automatically hold bookings. Credit controllers review alerts and decide whether to block new shipments or extend temporary credit.",

  "PRC-127":
    "Vendor Invoice Processing handles invoices received from suppliers and service providers like terminals, port agents, and trucking companies. Shipping companies deal with thousands of vendor invoices from ports around the world. The system matches vendor invoices to purchase orders and service records, flagging discrepancies. Accounts payable staff review and approve vendor invoices for payment.",

  "PRC-128":
    "Purchase Order Management creates and tracks purchase orders for goods and services the company needs to buy. POs ensure spending is authorized, budgeted, and properly documented. The system routes POs through approval workflows based on amount and category, then tracks delivery against the order. Procurement staff create POs, and department managers approve them.",

  "PRC-129":
    "Three-Way Matching automatically compares purchase orders, goods receipts, and vendor invoices to ensure they all agree before authorizing payment. This prevents paying for goods not ordered or not received. The system flags mismatches in quantities, prices, or descriptions for human review. Accounts payable staff investigate and resolve any discrepancies before payment.",

  "PRC-130":
    "Payment Run Processing batches approved vendor invoices and processes payments through bank transfers at scheduled intervals. Batch processing is more efficient than individual payments and helps manage cash flow. The system groups payments by bank, currency, and due date, then generates payment files for the bank. Treasury and accounts payable staff schedule and execute payment runs.",

  "PRC-131":
    "Bank Reconciliation matches transactions in the company's bank statements against entries in the accounting system. This ensures all money coming in and going out is properly recorded and identifies any discrepancies. The system auto-matches most transactions and flags unmatched items for investigation. Finance staff reconcile bank accounts regularly, typically daily or weekly.",

  "PRC-132":
    "FX Rate Management handles foreign exchange rates used for converting transactions in different currencies. Shipping companies deal in many currencies, so accurate exchange rates are critical for correct invoicing and financial reporting. The system downloads daily exchange rates from central banks and applies them to transactions. Treasury staff manage exchange rate policies and hedge significant exposures.",

  "PRC-133":
    "Intercompany Settlement manages financial transactions between different legal entities within the same shipping group. A shipment often involves multiple group companies in different countries, each of which needs to be compensated for its role. The system tracks intercompany charges and generates settlement statements between entities. Group accounting staff reconcile and settle intercompany balances periodically.",

  "PRC-134":
    "Revenue Recognition determines when freight revenue should be recorded in the financial accounts according to accounting standards. Revenue must be recognized over the voyage period, not all at once at booking or delivery. The system calculates the percentage of voyage completion and recognizes revenue proportionally. Finance staff run revenue recognition processes at each reporting period close.",

  "PRC-135":
    "Cost Allocation distributes shared costs like vessel operating expenses to specific voyages, trade lanes, and services. Proper cost allocation gives management an accurate picture of profitability by route and customer. The system applies allocation rules based on factors like capacity used, revenue share, or actual consumption. Finance staff configure allocation rules, and the system applies them during period close.",

  "PRC-136":
    "Period End Close manages the monthly and quarterly financial closing process, ensuring all transactions are recorded and reports are accurate. Timely and accurate financial closes are required for management reporting and regulatory compliance. The system orchestrates closing tasks, tracks completion, and prevents entries after cutoff. The finance team executes closing procedures according to a structured checklist.",

  "PRC-137":
    "Tax Calculation computes applicable taxes on transactions, including VAT, GST, withholding tax, and customs duties across multiple jurisdictions. Shipping companies operate globally, so tax calculations involve many different country-specific rules. The system applies the correct tax rates and rules based on the transaction type and location. Tax specialists configure tax rules, and the system applies them automatically.",

  "PRC-138":
    "Fixed Asset Management tracks the company's physical assets like vessels, containers, terminal equipment, and office buildings throughout their life. This includes recording acquisitions, calculating depreciation, scheduling maintenance, and tracking disposals. The system maintains the asset register and calculates depreciation according to accounting policies. Finance and operations staff manage asset records and periodic valuations.",

  "PRC-139":
    "Budget vs Actual Reporting compares planned budgets against actual spending and revenue to identify variances. Variance analysis helps management understand why results differ from plans and take corrective action. The system automatically calculates variances at every level from department to company-wide. Finance teams prepare these reports, and department managers explain significant variances.",

  "PRC-140":
    "Cash Flow Forecasting predicts the company's future cash position by projecting incoming payments, outgoing expenses, and planned investments. Knowing when cash will be tight allows the company to arrange financing in advance. AI models analyze payment patterns, seasonal trends, and planned expenditures to project cash flows. Treasury and finance managers use forecasts to manage liquidity and investment decisions.",

  // ── H. HR & PROCUREMENT (PRC-141 to PRC-160) ──

  "PRC-141":
    "Crew Planning manages the rotation schedules for vessel crews, ensuring every ship has qualified officers and ratings at all times. Crew changes are complex because they involve visa requirements, travel logistics, and regulatory rest period rules. The system tracks crew contracts, certification expiry, and available replacements to plan rotations. Crew managers schedule rotations months in advance to avoid last-minute staffing gaps.",

  "PRC-142":
    "Crew Certification Tracking monitors the validity of mandatory certificates held by all seafarers, such as STCW qualifications, medical certificates, and flag state endorsements. Sailing with expired certificates can result in vessel detention by port authorities. The system alerts crew managers well before certificates expire so renewals can be arranged. Crew managers and training coordinators ensure all certifications remain current.",

  "PRC-143":
    "Crew Payroll Processing calculates and pays wages for vessel crew members, handling complex rules like different currencies, tax treaties, and sea-time calculations. Crew payroll is more complicated than shore staff because of varying contract terms, allowances, and multi-currency payments. The system applies the correct pay scales, deductions, and allotments for each crew member. Payroll staff process crew wages monthly or per contract period.",

  "PRC-144":
    "Crew Travel Management arranges flights, hotels, and ground transport for crew members joining or leaving vessels at ports around the world. Crew travel is a significant cost, and last-minute changes due to schedule disruptions make it challenging. The system finds optimal travel routes, manages visa requirements, and books transportation. Crew travel coordinators arrange logistics for every crew change.",

  "PRC-145":
    "Shore Staff Recruitment manages the hiring process for office-based employees from job posting through to offer acceptance. Finding skilled maritime professionals is competitive, so an efficient recruitment process matters. The system tracks candidates through screening, interviews, and evaluation stages. HR staff and hiring managers collaborate through the system to select the best candidates.",

  "PRC-146":
    "Employee Onboarding guides new shore-based employees through their first days and weeks, ensuring they complete paperwork, get system access, and receive necessary training. A smooth onboarding experience helps new employees become productive faster and improves retention. The system creates personalized onboarding checklists and tracks completion. HR staff and the new employee's manager oversee the onboarding process.",

  "PRC-147":
    "Leave Management handles employee leave requests, approvals, balance tracking, and leave calendar coordination. Proper leave management ensures adequate staffing while respecting employee entitlements. The system enforces leave policies, checks balances, and routes approvals to the right managers. Employees submit requests through the portal, and managers approve them based on team coverage needs.",

  "PRC-148":
    "Attendance Tracking records employee working hours, absences, and overtime for payroll and compliance purposes. Accurate attendance data is needed for correct pay calculation and labor law compliance. The system captures clock-in and clock-out times and flags irregularities like excessive overtime. HR and payroll staff use attendance data for payroll processing and compliance reporting.",

  "PRC-149":
    "Performance Review manages the periodic evaluation of employee performance against objectives and competencies. Regular performance reviews help employees develop their careers and help the company identify high performers and improvement needs. The system facilitates goal setting, self-assessments, manager reviews, and calibration discussions. Managers and employees complete reviews, with HR overseeing the overall process.",

  "PRC-150":
    "Training Management administers training programs for both shore staff and seafarers, tracking completion and effectiveness. The maritime industry requires extensive regulatory training, plus professional development to build capabilities. The system maintains a training catalog, tracks certifications, and schedules courses. Training managers plan programs, and the system tracks each employee's training history.",

  "PRC-151":
    "Requisition Processing handles internal requests from departments to purchase goods or services. This ensures spending is properly authorized and budgeted before purchase orders are created. The system routes requisitions through approval chains based on amount and department, checking budget availability. Department staff submit requisitions, and their managers approve them before procurement takes over.",

  "PRC-152":
    "Vendor Sourcing finds and evaluates potential suppliers for goods and services the company needs. Getting the right vendors at competitive prices directly impacts operational costs and quality. The system maintains a vendor database, manages RFQ processes, and tracks vendor qualifications. Procurement specialists search for vendors and evaluate proposals based on price, quality, and reliability.",

  "PRC-153":
    "Purchase Order Creation generates formal purchase orders from approved requisitions, committing the company to buy specific goods or services. POs are legal documents that define what is being bought, the price, and delivery terms. The system creates POs from approved requisitions, applies contract pricing, and sends them to vendors. Procurement staff finalize and issue purchase orders to selected vendors.",

  "PRC-154":
    "Goods Receipt Processing records the arrival and inspection of goods ordered through purchase orders. Confirming receipt is essential for triggering payment and updating inventory records. The system matches received goods against the purchase order and records any quantity or quality discrepancies. Warehouse staff or department recipients confirm receipt of goods in the system.",

  "PRC-155":
    "Vendor Evaluation rates supplier performance based on criteria like delivery timeliness, quality, pricing, and responsiveness. Regular vendor evaluation helps maintain a reliable supply base and gives leverage in negotiations. The system compiles delivery and quality data to calculate vendor scorecards automatically. Procurement managers review vendor scores and use them in contract renewal decisions.",

  "PRC-156":
    "Contract Renewal manages the process of renewing or renegotiating vendor contracts before they expire. Missing a renewal deadline can disrupt supply chains or result in unfavorable automatic extensions. The system tracks contract expiration dates and triggers renewal workflows well in advance. Procurement and legal teams review terms and negotiate renewals with vendors.",

  "PRC-157":
    "Spare Parts Management tracks and manages the inventory of spare parts needed to maintain vessels and equipment. Having the right parts available prevents costly vessel downtime, while overstocking ties up capital unnecessarily. The system monitors stock levels, tracks usage patterns, and triggers reorder points. Technical superintendents and procurement staff manage spare parts inventories.",

  "PRC-158":
    "Provisions Management handles the ordering and delivery of food, water, and supplies consumed by vessel crews during voyages. Adequate and quality provisions are a regulatory requirement and affect crew morale. The system calculates provision needs based on crew size, voyage duration, and dietary requirements. Ship chandler coordinators and ship masters manage provisions ordering and delivery.",

  "PRC-159":
    "Ship Chandler Management coordinates with ship chandlers who supply vessels with provisions, stores, and supplies at ports worldwide. Reliable chandler relationships ensure vessels receive quality supplies at competitive prices. The system maintains a database of approved chandlers by port and manages ordering and delivery tracking. Procurement and fleet management staff select and manage chandler relationships.",

  "PRC-160":
    "Procurement Analytics provides reports and dashboards analyzing the company's procurement spending patterns and vendor performance. Understanding where money is being spent helps identify savings opportunities and negotiate better deals. The system aggregates purchase data across categories, departments, and vendors to reveal trends. Procurement managers and finance teams use analytics to drive cost optimization.",

  // ── I. COMPLIANCE & RISK (PRC-161 to PRC-180) ──

  "PRC-161":
    "ISM Code Compliance manages the company's Safety Management System as required by the International Safety Management Code. ISM compliance is mandatory for all commercial vessels and involves documented procedures, audits, and continuous improvement. The system maintains safety procedures, tracks non-conformities, and schedules internal and external audits. The Designated Person Ashore and safety officers manage ISM compliance.",

  "PRC-162":
    "ISPS Code Compliance ensures the company meets International Ship and Port Facility Security requirements. ISPS sets minimum security standards for ships, ports, and government agencies, aimed at detecting threats to maritime security. The system tracks security plans, manages security drills, and maintains required records. Company Security Officers and Ship Security Officers oversee compliance.",

  "PRC-163":
    "MLC Compliance ensures the company meets Maritime Labour Convention requirements covering seafarer working conditions, wages, rest hours, and living standards. MLC protects seafarers' rights and its compliance is checked during port state inspections. The system tracks rest hours, monitors contract terms, and maintains employment records. HR and crew management teams ensure all vessels meet MLC standards.",

  "PRC-164":
    "Flag State Compliance manages compliance with the regulations of each country where the company's vessels are registered. Flag states set rules on safety, crewing, and environmental standards that vessels must follow. The system tracks flag state requirements, certificate renewals, and inspection schedules for each vessel. Technical and compliance teams maintain flag state compliance across the fleet.",

  "PRC-165":
    "Class Survey Scheduling manages the schedule of periodic surveys required by classification societies to maintain a vessel's class status. Losing class means a vessel cannot trade or be insured, so surveys must be completed on time. The system tracks survey due dates, plans survey windows during port calls, and manages surveyor appointments. Technical superintendents coordinate survey schedules with classification societies.",

  "PRC-166":
    "P&I Insurance Management handles the company's Protection and Indemnity insurance, which covers third-party liabilities including cargo damage, crew injury, and pollution. P&I insurance is essential and among the largest insurance costs for a shipping company. The system tracks policy terms, premium payments, and claims history. Insurance managers and claims handlers work with P&I clubs on coverage and claims.",

  "PRC-167":
    "H&M Insurance Management administers Hull and Machinery insurance policies that cover physical damage to the company's vessels. This insurance protects the company's biggest physical assets against damage from collisions, groundings, and weather. The system manages policy renewals, premium calculations based on fleet value, and claims submissions. Insurance managers negotiate H&M coverage with underwriters annually.",

  "PRC-168":
    "Cargo Insurance manages insurance coverage for cargo being transported, protecting against loss or damage during the voyage. While cargo insurance is typically the shipper's responsibility, the company may offer it as a value-added service. The system calculates premiums based on cargo value, type, and route, and issues certificates. Insurance staff manage cargo insurance policies and process claims.",

  "PRC-169":
    "Claims Processing manages the submission and tracking of insurance claims when incidents occur, from initial notification through settlement. Efficient claims handling helps the company recover losses and maintain good relationships with insurers. The system guides staff through the claims process, tracks documentation requirements, and monitors settlement progress. Claims handlers work with insurers, surveyors, and internal teams to resolve claims.",

  "PRC-170":
    "Cargo Claims Management handles claims from customers when their cargo is damaged, lost, or delayed during shipping. Cargo claims are a significant cost and affect customer relationships if not handled well. The system logs claims, tracks investigation progress, and helps determine liability based on documentation and inspection reports. Claims staff investigate each claim and negotiate settlements with customers.",

  "PRC-171":
    "Loss Prevention Analysis studies patterns in cargo damage, theft, and loss to identify root causes and prevent future incidents. Preventing losses is far cheaper than paying claims and replacing damaged cargo. AI analyzes claims history, shipping routes, and cargo types to identify high-risk patterns and recommend preventive measures. Loss prevention specialists use these insights to improve handling procedures and training.",

  "PRC-172":
    "Subrogation Tracking manages the process of recovering money from third parties who were responsible for losses that the company or its insurer paid for. Successful subrogation recoveries can return significant amounts to the company. The system tracks potential recovery cases, manages deadlines, and monitors progress with legal counsel. Claims and legal teams pursue subrogation claims against responsible parties.",

  "PRC-173":
    "Audit Planning creates and manages the schedule of internal audits across all company departments and vessels. Regular audits verify that procedures are being followed and identify areas for improvement. The system plans audit cycles, assigns auditors, and tracks findings and corrective actions. Internal audit teams plan and conduct audits based on risk assessment and regulatory requirements.",

  "PRC-174":
    "Risk Register Update maintains the company's comprehensive list of identified risks, their likelihood, impact, and mitigation measures. An up-to-date risk register helps management make informed decisions and prepare for potential problems. The system prompts regular risk reviews, tracks mitigation actions, and alerts management to emerging risks. Risk management and department heads review and update the register periodically.",

  "PRC-175":
    "Regulatory Change Tracking monitors changes in maritime laws, regulations, and industry standards that affect the company's operations. Staying ahead of regulatory changes prevents compliance violations and allows time to prepare. The system scans regulatory sources, flags relevant changes, and assigns impact assessments to appropriate teams. Legal, compliance, and operations teams evaluate and implement required changes.",

  "PRC-176":
    "MARPOL Compliance Monitoring ensures vessels comply with the International Convention for the Prevention of Pollution from Ships. MARPOL covers oil pollution, noxious substances, sewage, garbage, and air emissions from vessels. The system tracks compliance certificates, monitors emissions, and maintains the required logs and records. Environmental officers and ship officers maintain MARPOL compliance onboard and ashore.",

  "PRC-177":
    "Ballast Water Management monitors and records ballast water treatment operations as required by the Ballast Water Management Convention. Untreated ballast water can introduce invasive species to new environments, causing ecological damage. The system tracks ballast water exchanges and treatment system operations, maintaining required records. Ship officers operate the treatment systems, and environmental staff ensure compliance documentation is complete.",

  "PRC-178":
    "Air Emission Tracking monitors and records air emissions from vessels, including sulfur oxides, nitrogen oxides, and greenhouse gases. Environmental regulations are getting stricter, and shipping companies must demonstrate they are reducing emissions. The system calculates emissions based on fuel consumption data and tracks compliance with emission control area requirements. Environmental and fleet management teams monitor emissions and report to regulators.",

  "PRC-179":
    "Incident Investigation manages the process of investigating maritime incidents such as collisions, groundings, equipment failures, or injuries. Thorough investigation identifies root causes and prevents similar incidents from happening again. The system guides investigators through a structured process, collects evidence, and tracks corrective actions. Safety officers lead investigations with input from the crew and shore-based technical teams.",

  "PRC-180":
    "Regulatory Reporting generates and submits the many reports required by maritime authorities, flag states, port states, and classification societies. Missing reporting deadlines can result in fines, vessel detentions, or loss of operating licenses. The system compiles required data, formats reports according to each authority's requirements, and tracks submission deadlines. Compliance and operations staff prepare and submit regulatory reports.",

  // ── J. ANALYTICS & INTELLIGENCE (PRC-181 to PRC-200) ──

  "PRC-181":
    "Trade Lane Analytics provides dashboards showing key performance indicators for each shipping route, including volume trends, revenue, costs, and transit times. These dashboards give commercial and operations leaders a clear picture of how each trade lane is performing. The system automatically aggregates data from bookings, voyages, and financial records into visual reports. Analysts and managers review these dashboards to spot trends and make strategic decisions.",

  "PRC-182":
    "Voyage Analytics analyzes the performance of individual voyages and service strings, comparing planned versus actual results. Understanding voyage performance helps improve future planning and identify recurring operational issues. The system compares estimated and actual costs, revenues, port times, and fuel consumption for each voyage. Operations and finance teams use voyage analytics to drive continuous improvement.",

  "PRC-183":
    "Customer Revenue Analysis examines revenue patterns by customer, identifying trends in volume, rate levels, cargo mix, and profitability. Understanding which customers are most valuable and how their behavior is changing helps shape commercial strategy. The system analyzes booking and billing data to produce customer revenue profiles and trend reports. Commercial teams use these insights for account planning and rate negotiations.",

  "PRC-184":
    "Predictive Demand Forecasting uses AI models to predict future cargo volumes by trade lane, season, and customer segment. Accurate demand forecasts help the company plan capacity, pricing, and equipment positioning ahead of time. The system analyzes historical data, economic indicators, and market signals to generate forecasts. Commercial planners use demand forecasts for capacity planning and pricing strategy.",

  "PRC-185":
    "Market Intelligence Gathering automatically collects and synthesizes market news, competitor activity, and industry trends from multiple sources. Staying informed about market developments helps the company respond quickly to opportunities and threats. AI scans news feeds, industry publications, and market data to produce concise intelligence summaries. Commercial and strategy teams receive daily or weekly market intelligence briefings.",

  "PRC-186":
    "Operational KPI Calculation computes cross-functional performance metrics that span multiple departments, giving management a holistic view of operations. Single-department metrics can miss important interactions, so cross-domain KPIs provide a more complete picture. The system pulls data from operations, finance, commercial, and equipment systems to calculate composite metrics. Senior management reviews operational KPIs in regular performance meetings.",

  "PRC-187":
    "Cost Benchmarking compares the company's costs across operations, ports, and services against internal benchmarks and industry standards. Understanding where costs are higher than expected reveals opportunities for savings. The system normalizes cost data to enable fair comparisons across different routes, vessels, and time periods. Finance and operations managers use benchmarking to set cost reduction targets.",

  "PRC-188":
    "ESG Reporting compiles and publishes the company's Environmental, Social, and Governance performance data for stakeholders and regulators. ESG reporting is increasingly required by investors, customers, and regulations, and affects the company's reputation and financing costs. The system collects emissions data, social metrics, and governance records to produce comprehensive ESG reports. Sustainability officers and finance teams prepare ESG disclosures.",

  "PRC-189":
    "Fleet Utilization Analysis measures how effectively the vessel fleet is being used in terms of capacity, sailing days, and idle time. Low utilization means assets are not earning their keep, while overutilization can strain vessels and schedules. The system calculates utilization metrics for each vessel and the fleet overall, highlighting underperforming assets. Fleet managers and commercial teams use utilization data to optimize vessel deployment.",

  "PRC-190":
    "Carbon Footprint Calculation computes the carbon emissions for each shipment, voyage, and the company as a whole. Customers increasingly demand carbon footprint data for their supply chains, and regulations are tightening on emissions reporting. The system calculates emissions based on fuel consumption, distance, and cargo weight using industry-standard methodologies. Environmental teams maintain the calculation models and provide emission reports to customers.",

  "PRC-191":
    "Port Productivity Analysis measures the efficiency of cargo operations at each port the company uses. Knowing which ports are fast and which are slow helps optimize vessel schedules and negotiate better terminal agreements. The system tracks crane rates, vessel turnaround times, and gate processing speeds at every port. Operations analysts compare port performance and share findings with terminal partners.",

  "PRC-192":
    "Document Analytics tracks metrics about the document processing workflow, such as processing times, error rates, and amendment frequencies. Understanding document processing efficiency helps identify bottlenecks and training needs. The system measures how long each type of document takes to process and how often corrections are needed. Documentation managers use these metrics to improve team productivity and accuracy.",

  "PRC-193":
    "Financial Analytics Dashboard provides a visual overview of the company's key financial metrics, including revenue, costs, profitability, and cash flow trends. Executives need quick access to financial performance data for decision-making. The system aggregates financial data from accounting, billing, and cost systems into interactive dashboards. Finance leadership and senior management use these dashboards for daily monitoring and board reporting.",

  "PRC-194":
    "Crew Analytics analyzes crew-related data including costs per vessel, overtime patterns, certification compliance, and turnover rates. Understanding crew patterns helps optimize manning costs and improve retention of qualified seafarers. The system compiles crew data from payroll, certification, and operational systems into analytical reports. HR and fleet management teams use crew analytics for workforce planning.",

  "PRC-195":
    "Equipment Performance Analytics measures the efficiency and cost-effectiveness of the container fleet and other transport equipment. Knowing which equipment types generate the best returns helps guide fleet investment decisions. The system tracks utilization, maintenance costs, damage rates, and revenue generation by equipment type. Equipment managers and fleet strategists use these insights for fleet optimization.",

  "PRC-196":
    "Procurement Spend Analysis examines purchasing patterns across the company to identify savings opportunities and consolidation potential. Many shipping companies buy the same types of goods and services at different locations without coordinating, missing volume discounts. The system categorizes spend by vendor, category, and location to reveal patterns. Procurement managers use spend analysis to negotiate better deals and reduce costs.",

  "PRC-197":
    "Customer Satisfaction Scoring calculates satisfaction scores like Net Promoter Score and Customer Satisfaction Score from survey responses and interaction data. Tracking satisfaction over time shows whether service improvements are working and which areas still need attention. The system combines survey results with operational data like on-time delivery and claim frequency to produce composite scores. Customer experience and commercial teams review satisfaction scores regularly.",

  "PRC-198":
    "Service Reliability Metrics tracks schedule reliability, transit time consistency, and other service quality measures that matter most to customers. Reliability is often more important to shippers than speed, so measuring it helps the company differentiate itself. The system calculates reliability percentages by comparing planned versus actual departures, arrivals, and transit times. Operations and commercial teams monitor reliability metrics and investigate dips.",

  "PRC-199":
    "Competitive Benchmarking compares the company's operational and financial performance against peer shipping companies. Understanding how the company stacks up against competitors helps set realistic improvement targets. The system analyzes publicly available peer data alongside internal metrics to produce comparison reports. Strategy and senior management teams use benchmarking to guide strategic priorities.",

  "PRC-200":
    "Trend Forecasting uses AI to project future industry trends in areas like trade volumes, fuel prices, regulatory changes, and technology adoption. Long-term trend analysis helps the company prepare for changes before they happen. The system analyzes historical data, economic models, and expert forecasts to identify emerging trends. Strategy and commercial teams use trend forecasts for long-range planning.",

  // ── K. PLATFORM & ADMINISTRATION (PRC-201 to PRC-220) ──

  "PRC-201":
    "Tenant Provisioning sets up new company tenants in the multi-tenant ERP system, creating their isolated data environment and base configuration. Each shipping company using the platform gets its own secure space where its data is completely separate from others. The system automates the creation of databases, default settings, and initial user accounts. System administrators provision new tenants as part of the customer onboarding process.",

  "PRC-202":
    "Entity Setup configures the legal entities, branch offices, and organizational units within a tenant. Shipping companies often have multiple legal entities in different countries, each with its own regulations and reporting requirements. The system creates entity profiles with tax registrations, currencies, chart of accounts, and inter-entity relationships. Finance and IT staff configure entities during initial setup or when the company structure changes.",

  "PRC-203":
    "User Provisioning creates and manages user accounts, granting people access to the system with the right permissions. Proper user management ensures employees can do their jobs while protecting sensitive data from unauthorized access. The system automates account creation, syncs with HR data for joiners and leavers, and enforces password policies. IT administrators manage user accounts, often triggered by HR onboarding and offboarding workflows.",

  "PRC-204":
    "Role Assignment manages the role-based access control system, defining which roles can access which features and data. Different people need different levels of access, from vessel planners seeing stowage plans to finance staff seeing accounting data. The system maintains role definitions with specific permissions and assigns roles to users. IT security and department managers collaborate to define and assign appropriate roles.",

  "PRC-205":
    "Workflow Creation allows administrators to design and deploy business process workflows without writing code. Different shipping companies have different approval chains, escalation rules, and process variations. The system provides a visual workflow builder where administrators can configure steps, conditions, and actions. Business analysts and IT staff create workflows based on the company's operational procedures.",

  "PRC-206":
    "Notification Routing determines who receives which system notifications and through what channel, such as email, SMS, or in-app alerts. Getting the right notifications to the right people at the right time prevents information overload while ensuring nothing critical is missed. The system routes notifications based on user roles, preferences, and the urgency of the event. Users configure their notification preferences, and administrators set up routing rules for system events.",

  "PRC-207":
    "Master Data Validation checks that foundational reference data like port codes, vessel details, currency codes, and customer information meets quality standards. Bad master data causes errors throughout the system, from incorrect invoices to misrouted cargo. The system validates data against business rules and external references like UN port codes. Data stewards maintain master data quality and resolve validation failures.",

  "PRC-208":
    "Data Quality Monitoring continuously checks the quality of data across the system by looking for duplicates, inconsistencies, missing values, and outdated records. Poor data quality leads to wrong decisions, customer complaints, and regulatory issues. The system runs automated quality checks and produces data quality scorecards. Data quality analysts investigate issues and coordinate cleanup with data owners.",

  "PRC-209":
    "Integration Management oversees all the connections between the ERP system and external systems like banking platforms, customs authorities, terminal systems, and partner shipping lines. Reliable integrations keep data flowing between systems without manual intervention. The system monitors integration health, logs data exchanges, and alerts staff when connections fail. IT integration specialists maintain and troubleshoot system connections.",

  "PRC-210":
    "API Gateway Management controls and monitors access to the system's application programming interfaces used by external partners and applications. APIs enable automated data exchange, but they must be secured and managed to prevent abuse. The system manages API keys, rate limits, usage monitoring, and access policies. IT teams manage API access and work with external partners on integration requirements.",

  "PRC-211":
    "EDI Processing handles Electronic Data Interchange messages, the standardized electronic formats used for exchanging shipping documents between companies. EDI is the backbone of automated communication in shipping, handling booking requests, shipping instructions, and status updates. The system translates between internal data formats and standard EDI formats like EDIFACT and ANSI X12. IT and operations staff maintain EDI connections with customers, partners, and authorities.",

  "PRC-212":
    "Report Builder allows users to create custom reports by selecting data fields, filters, and formatting options without needing technical skills. Standard reports do not always meet every user's specific needs, so self-service reporting fills the gaps. The system provides a drag-and-drop interface for building reports with access to all relevant data. Business users create their own reports, while IT can assist with complex data requirements.",

  "PRC-213":
    "Mobile Data Sync ensures that data entered or viewed on mobile devices stays synchronized with the main server in real time. Field staff like port captains, container inspectors, and sales reps need current data on their phones and tablets. The system handles data synchronization even when connectivity is intermittent, queuing updates until a connection is available. IT teams maintain the mobile platform, and field staff use the mobile apps in their daily work.",

  "PRC-214":
    "Knowledge Base Indexing organizes and indexes the help documentation, procedures, and reference materials so users can quickly find answers. An easy-to-search knowledge base reduces support tickets and helps users learn the system faster. AI indexes content, creates search suggestions, and recommends relevant articles based on what the user is doing. Content authors maintain the knowledge base, and the system makes it easily discoverable.",

  "PRC-215":
    "Training Content Delivery provides personalized training materials and courses to users based on their role and skill level. Effective training helps users get the most out of the system and reduces errors. The system recommends training content based on the user's role, assigns mandatory courses, and tracks completion. Training coordinators create content, and the system delivers it to the right people at the right time.",

  "PRC-216":
    "Implementation Tracking monitors the progress of ERP system rollout across departments, offices, and vessels. Large ERP implementations happen in phases, and tracking progress ensures nothing falls through the cracks. The system tracks go-live status by location, module, and milestone, flagging delays and risks. Project managers and implementation teams use this to coordinate the rollout.",

  "PRC-217":
    "Change Request Management handles requests for system modifications, enhancements, or bug fixes from users. A structured change management process ensures modifications are properly evaluated, tested, and deployed without disrupting operations. The system logs requests, routes them for review and approval, and tracks implementation through testing and release. IT teams evaluate and implement changes, with business stakeholders approving priorities.",

  "PRC-218":
    "System Health Monitoring continuously checks the performance and availability of all system components, including servers, databases, and integrations. Downtime or slow performance directly affects business operations, so early detection of issues is critical. The system monitors response times, resource usage, error rates, and service availability around the clock. IT operations staff receive alerts when issues are detected and take corrective action.",

  "PRC-219":
    "Backup Management handles the regular backup of all system data and configurations to protect against data loss. Data loss from hardware failure, cyberattack, or human error could be devastating for a shipping company. The system performs automated backups on schedule, verifies backup integrity, and manages retention periods. IT operations staff monitor backup completion and periodically test data restoration procedures.",

  "PRC-220":
    "Audit Trail Analysis reviews the detailed logs of who did what in the system and when, for security investigation and compliance purposes. Audit trails help detect unauthorized access, investigate incidents, and prove compliance during audits. The system records every significant user action and provides search and analysis tools to investigate suspicious activity. IT security and compliance staff review audit trails regularly and during investigations.",

  // ── L. ADDITIONAL PROCESSES ──

  "PRC-221":
    "Vessel Arrival Notification automatically alerts all relevant parties — port authorities, customs, terminal operators, agents, and consignees — when a vessel is approaching port. Timely arrival notifications allow everyone to prepare berth, pilots, tugs, customs clearance, and cargo handling in advance. The system monitors the vessel's real-time position via AIS, calculates an accurate ETA, and distributes formatted notifications through EDI, email, and port community systems. The port agent confirms local arrangements based on the notification.",

  "PRC-222":
    "CFS Consolidation/Deconsolidation manages container freight station operations where multiple smaller shipments (LCL) are packed together into full containers for ocean transit, then unpacked at destination for individual delivery. This process is essential for customers who don't have enough cargo to fill a whole container. The system optimizes how cargo is grouped by destination and compatibility, creates stuffing plans, and tracks each individual shipment through the consolidation process. CFS supervisors oversee the physical packing and coordinate deliveries with consignees.",

  "PRC-223":
    "NVOCC House B/L Management handles the issuance and tracking of house bills of lading used by non-vessel-operating common carriers. NVOCCs act as intermediaries between shippers and the actual shipping line, issuing their own transport documents to customers while holding a master B/L from the carrier. The system generates house B/Ls, cross-references them against master B/Ls for consistency, and tracks surrender status at destination. Documentation clerks verify details, and destination agents coordinate cargo release upon B/L surrender.",

  "PRC-224":
    "Container Damage Assessment uses AI-powered image recognition to automatically detect and classify damage on shipping containers from photographs. Quick and accurate damage assessment is critical for determining repair needs, assigning liability, and maintaining container fleet quality. The system processes photos from gate cameras or mobile devices, identifies damage types like dents, rust, or holes, classifies severity per industry standards, and estimates repair costs. Inspectors review borderline cases, and maintenance managers authorize significant repairs.",

  "PRC-225":
    "Regional Customs Integration manages the specific customs requirements for Qatar, UAE, KSA, and India, including local documentation formats, duty calculations, and electronic filing with each country's customs authority. Each country has unique customs systems and rules that must be followed precisely to avoid delays and penalties. The system applies region-specific rules, calculates duties using local tariff schedules, generates declarations in the required electronic format, and submits them directly to authorities like Qatar QCD, UAE FTA, KSA ZATCA, or India ICEGATE. Customs brokers handle complex classifications, and compliance officers manage queries from authorities.",

  "PRC-226":
    "Feeder Agency Operations manages the coordination between mainline ocean vessels and smaller feeder vessels that serve ports not directly called by the main ship. Feeder services extend a shipping line's reach to smaller ports by transshipping cargo at hub ports. The system matches transshipment cargo to available feeder sailings, validates connection times, generates feeder documentation, and tracks cargo through the feeder leg. Feeder agents coordinate local port operations, while operations controllers monitor connection times to prevent missed connections.",

  "PRC-227":
    "Container Depot/Yard Operations manages the day-to-day operations of container storage facilities, including gate processing, container stacking, maintenance scheduling, and inventory management. Efficient depot operations ensure containers are available when needed and properly maintained between uses. The system optimizes yard stacking based on container type and expected pickup times, schedules cleaning and repairs, and provides real-time inventory visibility. Yard planners handle special cargo requirements, and gate clerks verify container condition during transactions.",
};
