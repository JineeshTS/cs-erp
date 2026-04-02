/**
 * E2E-04 Booking-to-Cash — Executor Configuration (D-006 Phase 3)
 *
 * All 25 steps — from cargo route calculation through revenue recognition.
 *
 * Step Execution Map:
 * | Step | Name                            | Mode          | Entity Table          | Action |
 * |------|---------------------------------|---------------|-----------------------|--------|
 * | 1    | Cargo route calculation         | ai_with_tools | scm_rate_quotations   | read   |
 * | 2    | Customer credit check           | ai_with_tools | scm_customers         | read   |
 * | 3    | Credit gate                     | gate          | —                     | —      |
 * | 4    | Quote generation                | ai_with_tools | scm_rate_quotations   | create |
 * | 5    | Booking creation & confirmation | crud          | scm_rate_quotations   | update |
 * | 6    | Space allocation on vessel      | ai_with_tools | scm_rate_quotations   | read   |
 * | 7    | Equipment reservation           | ai_with_tools | scm_rate_quotations   | read   |
 * | 8    | Truck dispatch                  | ai_with_tools | scm_rate_quotations   | read   |
 * | 9    | Cut-off schedule setting        | ai_with_tools | scm_rate_quotations   | read   |
 * | 10   | VGM processing                  | ai_with_tools | scm_rate_quotations   | read   |
 * | 11   | Cut-off enforcement check       | ai_with_tools | scm_rate_quotations   | read   |
 * | 12   | Container gate-in at terminal   | ai_with_tools | scm_rate_quotations   | read   |
 * | 13   | DG classification (conditional) | ai_with_tools | scm_rate_quotations   | read   |
 * | 14   | Stowage planning                | ai_with_tools | scm_rate_quotations   | read   |
 * | 15   | Customs export declaration      | ai_with_tools | scm_rate_quotations   | read   |
 * | 16   | Customs gate (exception)        | gate          | —                     | —      |
 * | 17   | Shipping instruction processing | ai_with_tools | scm_rate_quotations   | read   |
 * | 18   | Bill of Lading generation       | ai_with_tools | scm_rate_quotations   | create |
 * | 19   | BL release type determination   | ai_with_tools | scm_rate_quotations   | update |
 * | 20   | BL review gate                  | gate          | —                     | —      |
 * | 21   | Manifest compilation            | ai_with_tools | scm_rate_quotations   | read   |
 * | 22   | Freight invoice generation      | ai_with_tools | scm_rate_quotations   | create |
 * | 23   | Tax calculation per jurisdiction | ai_with_tools | scm_rate_quotations   | update |
 * | 24   | Cash application                | ai_with_tools | scm_rate_quotations   | update |
 * | 25   | Revenue recognition             | ai_with_tools | scm_rate_quotations   | read   |
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import type { StepExecutorConfig } from "./e2e-01-lead-to-quote";

// ═══════════════════════════════════════════════════════════
// E2E-04 STEP CONFIGS (All 25 Steps)
// ═══════════════════════════════════════════════════════════

export const E2E_04_STEP_CONFIGS: Record<number, StepExecutorConfig> = {
  // ── Step 1: Cargo Route Calculation (AI with tools → read scm_rate_quotations) ──
  1: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Route Calculation agent for a container shipping line. Calculate the optimal route between origin and destination ports considering transit time, transshipment points, available vessel schedules, and cost efficiency.",
    tools: [
      {
        name: "calculate_route",
        description:
          "Calculate the optimal shipping route between origin and destination ports considering transit time, transshipment points, vessel schedules, and cost",
        input_schema: {
          type: "object" as const,
          properties: {
            origin_port: {
              type: "string",
              description: "Origin port code (e.g., AEJEA)",
            },
            destination_port: {
              type: "string",
              description: "Destination port code (e.g., CNSHA)",
            },
            cargo_type: {
              type: "string",
              description: "Type of cargo (e.g., dry, reefer, DG, OOG)",
            },
            weight_kg: {
              type: "number",
              description: "Total cargo weight in kilograms",
            },
            required_delivery_date: {
              type: "string",
              description:
                "Required delivery date in ISO 8601 format (optional)",
            },
          },
          required: [
            "origin_port",
            "destination_port",
            "cargo_type",
            "weight_kg",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 2: Customer Credit Check (AI with tools → read scm_customers) ──
  2: {
    mode: "ai_with_tools",
    entityTable: "scm_customers",
    entityAction: "read",
    systemPromptExtra:
      "You are a Credit Assessment agent for a container shipping line. Check the customer's credit standing by evaluating their credit limit, current AR balance, payment history, and overall risk exposure. Recommend whether to approve, gate, or reject the booking.",
    tools: [
      {
        name: "check_credit",
        description:
          "Check the customer's credit standing by evaluating credit limit, AR balance, payment history, and risk exposure",
        input_schema: {
          type: "object" as const,
          properties: {
            customer_id: {
              type: "string",
              description: "UUID of the customer to check",
            },
            booking_value: {
              type: "number",
              description: "Total booking value in USD",
            },
          },
          required: ["customer_id", "booking_value"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 3: Credit Gate ──
  3: {
    mode: "gate",
  },

  // ── Step 4: Quote Generation (AI with tools → create scm_rate_quotations) ──
  4: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "create",
    systemPromptExtra:
      "You are a Rate Quotation agent for a container shipping line. Generate a competitive quotation based on the calculated route, cargo details, customer segment, contract rates, and current tariffs. Include ocean freight, surcharges, and total amount.",
    tools: [
      {
        name: "generate_quote",
        description:
          "Generate a competitive rate quotation based on route, cargo details, customer segment, and applicable tariffs",
        input_schema: {
          type: "object" as const,
          properties: {
            route_id: {
              type: "string",
              description: "UUID of the calculated route from step 1",
            },
            cargo_type: {
              type: "string",
              description: "Type of cargo (e.g., dry, reefer, DG, OOG)",
            },
            volume_teu: {
              type: "number",
              description: "Volume in TEU (twenty-foot equivalent units)",
            },
            customer_segment: {
              type: "string",
              description:
                "Customer segment classification (e.g., key_account, sme, spot)",
            },
            contract_id: {
              type: "string",
              description:
                "Existing contract ID for contracted rates (optional)",
            },
          },
          required: ["route_id", "cargo_type", "volume_teu"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 5: Booking Creation & Confirmation (CRUD → update scm_rate_quotations) ──
  5: {
    mode: "crud",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    fieldMapping: {
      "Equipment Type & Quantity": "_skip_metadata",
      "Cargo Description & Weight": "_skip_metadata",
      "Incoterms CIF/FOB/etc": "_skip_metadata",
    },
    defaults: {
      status: "confirmed",
    },
  },

  // ── Step 6: Space Allocation on Vessel (AI with tools → read scm_rate_quotations) ──
  6: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Space Allocation agent for a container shipping line. Allocate vessel space for the confirmed booking based on equipment type, cargo weight, current vessel capacity, and DG segregation constraints.",
    tools: [
      {
        name: "allocate_space",
        description:
          "Allocate vessel space for a confirmed booking considering equipment type, cargo weight, vessel capacity, and DG segregation",
        input_schema: {
          type: "object" as const,
          properties: {
            booking_id: {
              type: "string",
              description: "UUID of the confirmed booking",
            },
            equipment_type: {
              type: "string",
              description:
                "Container equipment type (e.g., 20GP, 40GP, 40HC, 20RF, 40RF)",
            },
            weight_kg: {
              type: "number",
              description: "Total cargo weight in kilograms",
            },
            is_dg: {
              type: "boolean",
              description:
                "Whether the cargo is dangerous goods requiring DG segregation",
            },
          },
          required: ["booking_id", "equipment_type", "weight_kg", "is_dg"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 7: Equipment Reservation (AI with tools → read scm_rate_quotations) ──
  7: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are an Equipment Reservation agent for a container shipping line. Reserve containers from the nearest depot based on equipment type, cargo requirements (food-grade, DG-rated), and pickup location.",
    tools: [
      {
        name: "reserve_equipment",
        description:
          "Reserve containers from the nearest depot based on equipment type, cargo requirements, and pickup location",
        input_schema: {
          type: "object" as const,
          properties: {
            equipment_type: {
              type: "string",
              description:
                "Container equipment type (e.g., 20GP, 40GP, 40HC, 20RF, 40RF)",
            },
            quantity: {
              type: "number",
              description: "Number of containers to reserve",
            },
            cargo_type: {
              type: "string",
              description:
                "Cargo type for special requirements (e.g., food-grade, DG-rated)",
            },
            pickup_location: {
              type: "string",
              description: "Depot or location for container pickup",
            },
          },
          required: [
            "equipment_type",
            "quantity",
            "cargo_type",
            "pickup_location",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 8: Truck Dispatch (AI with tools → read scm_rate_quotations) ──
  8: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Truck Dispatch agent for a container shipping line. Arrange empty container pickup from depot to shipper's premises. Select trucking company, schedule pickup, and generate truck booking reference.",
    tools: [
      {
        name: "dispatch_truck",
        description:
          "Arrange empty container pickup from depot to shipper premises, select trucking company, and generate booking reference",
        input_schema: {
          type: "object" as const,
          properties: {
            depot_location: {
              type: "string",
              description: "Container depot location for pickup",
            },
            shipper_address: {
              type: "string",
              description: "Shipper's premises address for delivery",
            },
            pickup_date: {
              type: "string",
              description: "Scheduled pickup date in ISO 8601 format",
            },
            container_numbers: {
              type: "array",
              items: { type: "string" },
              description: "List of container numbers to dispatch",
            },
          },
          required: [
            "depot_location",
            "shipper_address",
            "pickup_date",
            "container_numbers",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 9: Cut-off Schedule Setting (AI with tools → read scm_rate_quotations) ──
  9: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Cut-off Schedule agent for a container shipping line. Set documentation, VGM, and cargo cut-off deadlines based on vessel ETD and port-specific rules.",
    tools: [
      {
        name: "set_cutoffs",
        description:
          "Set documentation, VGM, and cargo cut-off deadlines based on vessel ETD and port-specific rules",
        input_schema: {
          type: "object" as const,
          properties: {
            vessel_etd: {
              type: "string",
              description:
                "Vessel estimated time of departure in ISO 8601 format",
            },
            load_port: {
              type: "string",
              description: "Load port code (e.g., AEJEA)",
            },
          },
          required: ["vessel_etd", "load_port"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 10: VGM Processing (AI with tools → read scm_rate_quotations) ──
  10: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a VGM Processing agent for a container shipping line. Validate the Verified Gross Mass submission, check the weighing method (Method 1 or 2), and ensure compliance with SOLAS requirements before the VGM cut-off deadline.",
    tools: [
      {
        name: "process_vgm",
        description:
          "Validate VGM submission, check weighing method, and ensure SOLAS compliance before VGM cut-off",
        input_schema: {
          type: "object" as const,
          properties: {
            container_number: {
              type: "string",
              description: "Container number for VGM verification",
            },
            vgm_weight: {
              type: "number",
              description: "Verified Gross Mass weight in kilograms",
            },
            weighing_method: {
              type: "string",
              enum: ["method_1", "method_2"],
              description:
                "VGM weighing method: method_1 (weigh packed container) or method_2 (weigh all contents + tare)",
            },
            vgm_cutoff: {
              type: "string",
              description: "VGM cut-off deadline in ISO 8601 format",
            },
          },
          required: [
            "container_number",
            "vgm_weight",
            "weighing_method",
            "vgm_cutoff",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: PRE-SHIPMENT OPERATIONS (Steps 11-13)
  // ═══════════════════════════════════════════════════════════

  // ── Step 11: Cut-off Enforcement Check (AI with tools → read) ──
  11: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Cut-off Enforcement agent for a container shipping line. Check if all cut-off deadlines are met (VGM, documentation, cargo gate-in). If any missed, recommend rolling cargo to next vessel or granting a late-arrival exception.",
    tools: [
      {
        name: "check_cutoff_compliance",
        description:
          "Check if all cut-off deadlines (VGM, documentation, cargo) are met and recommend action if missed",
        input_schema: {
          type: "object" as const,
          properties: {
            booking_id: {
              type: "string",
              description: "UUID of the booking to check",
            },
            vgm_cutoff: {
              type: "string",
              description: "VGM cut-off deadline in ISO 8601",
            },
            doc_cutoff: {
              type: "string",
              description: "Documentation cut-off deadline in ISO 8601",
            },
            cargo_cutoff: {
              type: "string",
              description: "Cargo receiving cut-off deadline in ISO 8601",
            },
            vgm_submitted: {
              type: "boolean",
              description: "Whether VGM has been submitted",
            },
            docs_submitted: {
              type: "boolean",
              description: "Whether all documentation has been submitted",
            },
            cargo_gated_in: {
              type: "boolean",
              description: "Whether cargo has been received at terminal",
            },
          },
          required: [
            "booking_id",
            "vgm_cutoff",
            "doc_cutoff",
            "cargo_cutoff",
            "vgm_submitted",
            "docs_submitted",
            "cargo_gated_in",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 12: Container Gate-In at Terminal (AI with tools → read) ──
  12: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Terminal Gate agent for a container shipping line. Process container gate-in at the terminal: verify the container number matches the booking, check seal integrity, assign yard position, and update tracking milestones.",
    tools: [
      {
        name: "process_gate_in",
        description:
          "Process container gate-in at terminal: verify container, check seal, assign yard position, update tracking",
        input_schema: {
          type: "object" as const,
          properties: {
            container_number: {
              type: "string",
              description: "Container number being gated in",
            },
            booking_reference: {
              type: "string",
              description: "Booking confirmation reference",
            },
            seal_number: {
              type: "string",
              description: "Container seal number",
            },
            truck_id: {
              type: "string",
              description: "Truck / driver identification",
            },
            vgm_weight: {
              type: "number",
              description: "VGM weight in kilograms for cross-check",
            },
          },
          required: [
            "container_number",
            "booking_reference",
            "seal_number",
            "truck_id",
            "vgm_weight",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 13: DG Classification (AI with tools → read, conditional) ──
  13: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a DG Compliance agent for a container shipping line. For dangerous goods cargo: verify IMDG classification (UN number, class, packing group), check segregation requirements against other cargo on the vessel, and validate the shipper's DG declaration against the IMDG Code.",
    tools: [
      {
        name: "classify_dangerous_goods",
        description:
          "Verify IMDG classification, check segregation, and validate DG declaration for dangerous goods cargo",
        input_schema: {
          type: "object" as const,
          properties: {
            un_number: {
              type: "string",
              description: "UN number from shipper's DG declaration (e.g., UN1263)",
            },
            proper_shipping_name: {
              type: "string",
              description: "Proper shipping name per IMDG Code",
            },
            imdg_class: {
              type: "string",
              description: "IMDG class (e.g., 3, 8, 2.1)",
            },
            packing_group: {
              type: "string",
              enum: ["I", "II", "III"],
              description: "Packing group (I=high danger, III=low danger)",
            },
            quantity_kg: {
              type: "number",
              description: "Quantity of DG cargo in kilograms",
            },
            vessel_id: {
              type: "string",
              description: "Vessel ID to check segregation against other booked DG",
            },
          },
          required: [
            "un_number",
            "proper_shipping_name",
            "imdg_class",
            "packing_group",
            "quantity_kg",
            "vessel_id",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: STOWAGE & CUSTOMS (Steps 14-16)
  // ═══════════════════════════════════════════════════════════

  // ── Step 14: Stowage Planning (AI with tools → read) ──
  14: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Stowage Planning agent for a container shipping line. Plan the exact stowage position for a container on a vessel. Consider weight stack limits, DG segregation, reefer plug proximity, discharge port sequence, and vessel stability.",
    tools: [
      {
        name: "plan_stowage",
        description:
          "Plan container stowage position on vessel considering weight limits, DG segregation, reefer plugs, discharge sequence, and stability",
        input_schema: {
          type: "object" as const,
          properties: {
            container_number: {
              type: "string",
              description: "Container number to stow",
            },
            weight_kg: {
              type: "number",
              description: "Container VGM weight in kilograms",
            },
            discharge_port: {
              type: "string",
              description: "Discharge port code (e.g., CNSHA)",
            },
            is_dg: {
              type: "boolean",
              description: "Whether cargo is dangerous goods",
            },
            is_reefer: {
              type: "boolean",
              description: "Whether container is a reefer requiring power",
            },
            dg_class: {
              type: "string",
              description: "IMDG class if DG cargo (optional)",
            },
            vessel_id: {
              type: "string",
              description: "Vessel ID for bay plan lookup",
            },
          },
          required: [
            "container_number",
            "weight_kg",
            "discharge_port",
            "is_dg",
            "is_reefer",
            "vessel_id",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 15: Customs Export Declaration (AI with tools → read) ──
  15: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Customs Compliance agent for a container shipping line. Prepare and file the export customs declaration with the origin country customs authority. Validate HS code classification, check export restrictions and sanctions, and obtain customs clearance.",
    tools: [
      {
        name: "file_customs_declaration",
        description:
          "Prepare and file export customs declaration: HS code validation, export restrictions check, and electronic filing",
        input_schema: {
          type: "object" as const,
          properties: {
            booking_id: {
              type: "string",
              description: "UUID of the booking",
            },
            shipper_name: {
              type: "string",
              description: "Shipper company name",
            },
            consignee_name: {
              type: "string",
              description: "Consignee company name",
            },
            hs_code: {
              type: "string",
              description: "Harmonized System code for the cargo (e.g., 8471.30)",
            },
            cargo_description: {
              type: "string",
              description: "Cargo description matching booking",
            },
            declared_value: {
              type: "number",
              description: "Declared cargo value in USD",
            },
            origin_country: {
              type: "string",
              description: "Country of export (ISO 3166 alpha-2)",
            },
            destination_country: {
              type: "string",
              description: "Country of import (ISO 3166 alpha-2)",
            },
          },
          required: [
            "booking_id",
            "shipper_name",
            "consignee_name",
            "hs_code",
            "cargo_description",
            "declared_value",
            "origin_country",
            "destination_country",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 16: Customs Gate — Exception (hold response) ──
  16: {
    mode: "gate",
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: DOCUMENTATION (Steps 17-21)
  // ═══════════════════════════════════════════════════════════

  // ── Step 17: Shipping Instruction Processing (AI with tools → read) ──
  17: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Documentation agent for a container shipping line. Process Shipping Instructions (SI) received from the shipper. Validate completeness, cross-check against the booking, and extract BL party details (shipper, consignee, notify party), goods description, and marks & numbers.",
    tools: [
      {
        name: "process_shipping_instructions",
        description:
          "Process and validate Shipping Instructions: extract BL details, cross-check against booking, flag discrepancies",
        input_schema: {
          type: "object" as const,
          properties: {
            booking_reference: {
              type: "string",
              description: "Booking confirmation number",
            },
            shipper_details: {
              type: "string",
              description: "Shipper name and address from SI",
            },
            consignee_details: {
              type: "string",
              description: "Consignee name and address from SI",
            },
            notify_party: {
              type: "string",
              description: "Notify party details from SI",
            },
            goods_description: {
              type: "string",
              description: "Cargo description from SI",
            },
            marks_and_numbers: {
              type: "string",
              description: "Shipping marks and numbers from SI",
            },
            number_of_originals: {
              type: "number",
              description: "Number of original BL copies requested",
            },
          },
          required: [
            "booking_reference",
            "shipper_details",
            "consignee_details",
            "goods_description",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 18: Bill of Lading Generation (AI with tools → create) ──
  18: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "create",
    systemPromptExtra:
      "You are a BL Generation agent for a container shipping line. Generate a Bill of Lading from the processed Shipping Instructions and booking data. The BL is a title document (receipt, contract of carriage, document of title). Populate all fields, calculate freight, and generate a unique BL number.",
    tools: [
      {
        name: "generate_bill_of_lading",
        description:
          "Generate Bill of Lading from SI and booking data: populate fields, calculate freight, generate BL number",
        input_schema: {
          type: "object" as const,
          properties: {
            booking_id: {
              type: "string",
              description: "UUID of the booking",
            },
            si_reference: {
              type: "string",
              description: "Processed SI reference from step 17",
            },
            container_numbers: {
              type: "array",
              items: { type: "string" },
              description: "Container numbers loaded on vessel",
            },
            seal_numbers: {
              type: "array",
              items: { type: "string" },
              description: "Seal numbers per container",
            },
            freight_terms: {
              type: "string",
              enum: ["prepaid", "collect"],
              description: "Freight payment terms",
            },
            freight_amount: {
              type: "number",
              description: "Total freight amount from quotation",
            },
          },
          required: [
            "booking_id",
            "si_reference",
            "container_numbers",
            "seal_numbers",
            "freight_terms",
            "freight_amount",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 19: BL Release Type Determination (AI with tools → update) ──
  19: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    systemPromptExtra:
      "You are a BL Release agent for a container shipping line. Determine the BL release method: Original (physical surrender at destination), Telex Release (electronic release), Sea Waybill (non-negotiable), or Express BL. Consider customer preference, L/C requirements, and freight payment status.",
    tools: [
      {
        name: "determine_release_type",
        description:
          "Determine BL release type based on customer preference, L/C requirements, and freight payment status",
        input_schema: {
          type: "object" as const,
          properties: {
            bl_number: {
              type: "string",
              description: "Bill of Lading number from step 18",
            },
            customer_preference: {
              type: "string",
              enum: ["original", "telex", "waybill", "express"],
              description: "Customer's preferred release method",
            },
            has_lc: {
              type: "boolean",
              description: "Whether shipment is under Letter of Credit terms",
            },
            freight_paid: {
              type: "boolean",
              description: "Whether freight has been paid (for prepaid BLs)",
            },
          },
          required: [
            "bl_number",
            "customer_preference",
            "has_lc",
            "freight_paid",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 20: BL Review Gate — Approval ──
  20: {
    mode: "gate",
  },

  // ── Step 21: Manifest Compilation (AI with tools → read) ──
  21: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Manifest Compilation agent for a container shipping line. Compile the cargo manifest for the voyage listing all cargo on board. The manifest is required by customs at destination and port authorities at each port of call. Cross-check totals against the stowage plan.",
    tools: [
      {
        name: "compile_manifest",
        description:
          "Compile cargo manifest from all approved BLs for the voyage, generate summary totals, and file with customs",
        input_schema: {
          type: "object" as const,
          properties: {
            voyage_id: {
              type: "string",
              description: "Vessel voyage ID",
            },
            port_of_loading: {
              type: "string",
              description: "Port of loading code (UN/LOCODE)",
            },
            bl_numbers: {
              type: "array",
              items: { type: "string" },
              description: "All approved BL numbers for this port loading",
            },
          },
          required: ["voyage_id", "port_of_loading", "bl_numbers"],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 6: INVOICING & SETTLEMENT (Steps 22-25)
  // ═══════════════════════════════════════════════════════════

  // ── Step 22: Freight Invoice Generation (AI with tools → create) ──
  22: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "create",
    systemPromptExtra:
      "You are a Freight Invoicing agent for a container shipping line. Generate a freight invoice based on confirmed rates, actual surcharges, and cargo details. For prepaid shipments invoice before sailing; for collect, invoice at destination after discharge. Include ocean freight, all surcharges (BAF, THC, LSS), and discounts.",
    tools: [
      {
        name: "generate_freight_invoice",
        description:
          "Generate freight invoice from BL, quotation, and actual cargo details including surcharges and discounts",
        input_schema: {
          type: "object" as const,
          properties: {
            bl_number: {
              type: "string",
              description: "Bill of Lading number",
            },
            quotation_id: {
              type: "string",
              description: "Rate quotation or contract reference",
            },
            actual_weight_kg: {
              type: "number",
              description: "Actual cargo weight from VGM",
            },
            actual_volume_cbm: {
              type: "number",
              description: "Actual cargo volume in CBM",
            },
            freight_terms: {
              type: "string",
              enum: ["prepaid", "collect"],
              description: "Freight payment terms",
            },
            customer_billing_id: {
              type: "string",
              description: "Customer billing entity ID",
            },
            currency: {
              type: "string",
              description: "Invoice currency (e.g., USD, AED, INR)",
            },
          },
          required: [
            "bl_number",
            "quotation_id",
            "actual_weight_kg",
            "freight_terms",
            "customer_billing_id",
            "currency",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 23: Tax Calculation per Jurisdiction (AI with tools → update) ──
  23: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    systemPromptExtra:
      "You are a Tax Compliance agent for a container shipping line operating in UAE (5% VAT), KSA (15% VAT), India (18% GST), and Qatar (0% VAT). Calculate applicable taxes based on origin/destination jurisdiction, customer tax status, service type, and apply exemptions where applicable (free zone, export, treaty).",
    tools: [
      {
        name: "calculate_tax",
        description:
          "Calculate VAT/GST per jurisdiction based on invoice amount, service type, and customer tax status",
        input_schema: {
          type: "object" as const,
          properties: {
            invoice_id: {
              type: "string",
              description: "Invoice ID from step 22",
            },
            invoice_amount: {
              type: "number",
              description: "Total pre-tax invoice amount",
            },
            origin_country: {
              type: "string",
              description: "Country of origin (ISO 3166 alpha-2)",
            },
            destination_country: {
              type: "string",
              description: "Country of destination (ISO 3166 alpha-2)",
            },
            customer_tax_id: {
              type: "string",
              description: "Customer tax registration number (GSTIN/VAT/TRN)",
            },
            service_type: {
              type: "string",
              enum: ["ocean_freight", "inland_transport", "documentation", "handling"],
              description: "Type of service for tax rate determination",
            },
            is_free_zone: {
              type: "boolean",
              description: "Whether customer is in a tax-free zone",
            },
          },
          required: [
            "invoice_id",
            "invoice_amount",
            "origin_country",
            "destination_country",
            "customer_tax_id",
            "service_type",
            "is_free_zone",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 24: Cash Application (AI with tools → update) ──
  24: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "update",
    systemPromptExtra:
      "You are a Cash Application agent for a container shipping line. When customer payment is received, match the payment to outstanding invoice(s), apply cash, update the AR balance, and release any BL holds tied to payment. Handle short/over payments and credit notes.",
    tools: [
      {
        name: "apply_cash",
        description:
          "Match customer payment to outstanding invoices, apply cash, update AR balance, and trigger BL release if applicable",
        input_schema: {
          type: "object" as const,
          properties: {
            payment_reference: {
              type: "string",
              description: "Bank payment reference / transaction ID",
            },
            payment_amount: {
              type: "number",
              description: "Payment amount received",
            },
            payment_currency: {
              type: "string",
              description: "Payment currency (e.g., USD, AED)",
            },
            customer_id: {
              type: "string",
              description: "UUID of the paying customer",
            },
            invoice_numbers: {
              type: "array",
              items: { type: "string" },
              description: "Invoice numbers to apply payment against",
            },
          },
          required: [
            "payment_reference",
            "payment_amount",
            "payment_currency",
            "customer_id",
            "invoice_numbers",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },

  // ── Step 25: Revenue Recognition (AI with tools → read) ──
  25: {
    mode: "ai_with_tools",
    entityTable: "scm_rate_quotations",
    entityAction: "read",
    systemPromptExtra:
      "You are a Revenue Recognition agent for a container shipping line. Recognize revenue based on percentage-of-completion for in-transit cargo, or on discharge for port-to-port terms, per IFRS 15. Calculate the appropriate revenue split between recognized and deferred revenue, and generate the GL journal entry.",
    tools: [
      {
        name: "recognize_revenue",
        description:
          "Recognize revenue per IFRS 15 based on voyage progress, calculate deferred vs recognized amounts, and generate GL journal entry",
        input_schema: {
          type: "object" as const,
          properties: {
            invoice_id: {
              type: "string",
              description: "Invoice ID from step 22",
            },
            invoice_amount: {
              type: "number",
              description: "Total invoice amount",
            },
            voyage_progress_pct: {
              type: "number",
              description: "Percentage of voyage completed (0-100)",
            },
            cargo_status: {
              type: "string",
              enum: ["loaded", "in_transit", "discharged", "delivered"],
              description: "Current cargo/tracking status",
            },
            recognition_method: {
              type: "string",
              enum: ["percentage_of_completion", "on_discharge", "on_delivery"],
              description: "Revenue recognition method per accounting policy",
            },
          },
          required: [
            "invoice_id",
            "invoice_amount",
            "voyage_progress_pct",
            "cargo_status",
            "recognition_method",
          ],
        },
      },
    ] as Anthropic.Tool[],
  },
};

/**
 * Get the executor config for a specific step in E2E-04.
 */
export function getE2e04StepConfig(
  stepNumber: number
): StepExecutorConfig | null {
  return E2E_04_STEP_CONFIGS[stepNumber] ?? null;
}
