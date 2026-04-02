/**
 * Typed event definitions for the CS-ERP event bus.
 * Every cross-module event MUST be defined here.
 */

// ── Base Event Shape ──

export interface BaseEvent {
  tenantId: string;
  userId: string;
  entityId: string;
  entityType: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  /** Event-specific payload — present on all concrete event types */
  data?: Record<string, unknown>;
}

// ── Booking & Documentation Events ──

export interface BookingCreatedEvent extends BaseEvent {
  type: "BOOKING_CREATED";
  entityType: "booking";
  data: {
    bookingNumber: string;
    customerId: string;
    tradeRoute: string;
    cargoType: string;
    containerCount: number;
  };
}

export interface BookingConfirmedEvent extends BaseEvent {
  type: "BOOKING_CONFIRMED";
  entityType: "booking";
  data: {
    bookingNumber: string;
    voyageId: string;
    customerId: string;
  };
}

export interface BookingCancelledEvent extends BaseEvent {
  type: "BOOKING_CANCELLED";
  entityType: "booking";
  data: {
    bookingNumber: string;
    reason: string;
  };
}

export interface BlIssuedEvent extends BaseEvent {
  type: "BL_ISSUED";
  entityType: "bill_of_lading";
  data: {
    blNumber: string;
    bookingId: string;
    shipperId: string;
    consigneeId: string;
  };
}

export interface BlSurrenderedEvent extends BaseEvent {
  type: "BL_SURRENDERED";
  entityType: "bill_of_lading";
  data: {
    blNumber: string;
    bookingId: string;
  };
}

// ── Container & Equipment Events ──

export interface ContainerGateInEvent extends BaseEvent {
  type: "CONTAINER_GATE_IN";
  entityType: "container";
  data: {
    containerNumber: string;
    terminalId: string;
    bookingId?: string;
    sealNumber?: string;
  };
}

export interface ContainerGateOutEvent extends BaseEvent {
  type: "CONTAINER_GATE_OUT";
  entityType: "container";
  data: {
    containerNumber: string;
    terminalId: string;
    deliveryOrderId?: string;
  };
}

export interface ContainerDamagedEvent extends BaseEvent {
  type: "CONTAINER_DAMAGED";
  entityType: "container";
  data: {
    containerNumber: string;
    damageType: string;
    severity: "minor" | "moderate" | "severe";
    estimatedRepairCost?: number;
  };
}

// ── Vessel & Voyage Events ──

export interface VesselArrivalEvent extends BaseEvent {
  type: "VESSEL_ARRIVED";
  entityType: "vessel";
  data: {
    vesselId: string;
    vesselName: string;
    portId: string;
    voyageId: string;
  };
}

export interface VesselDepartureEvent extends BaseEvent {
  type: "VESSEL_DEPARTED";
  entityType: "vessel";
  data: {
    vesselId: string;
    vesselName: string;
    portId: string;
    voyageId: string;
    nextPortId: string;
  };
}

export interface VoyageCompletedEvent extends BaseEvent {
  type: "VOYAGE_COMPLETED";
  entityType: "voyage";
  data: {
    voyageId: string;
    vesselId: string;
    actualDuration: number;
  };
}

// ── Customs & Compliance Events ──

export interface CustomsClearedEvent extends BaseEvent {
  type: "CUSTOMS_CLEARED";
  entityType: "customs_filing";
  data: {
    filingId: string;
    bookingId: string;
    customsAuthority: string;
    clearanceNumber: string;
  };
}

export interface CustomsHeldEvent extends BaseEvent {
  type: "CUSTOMS_HELD";
  entityType: "customs_filing";
  data: {
    filingId: string;
    bookingId: string;
    holdReason: string;
  };
}

// ── Financial Events ──

export interface InvoiceGeneratedEvent extends BaseEvent {
  type: "INVOICE_GENERATED";
  entityType: "invoice";
  data: {
    invoiceNumber: string;
    customerId: string;
    amount: number;
    currency: string;
    dueDate: string;
    bookingId?: string;
  };
}

export interface PaymentReceivedEvent extends BaseEvent {
  type: "PAYMENT_RECEIVED";
  entityType: "payment";
  data: {
    paymentId: string;
    invoiceId: string;
    customerId: string;
    amount: number;
    currency: string;
  };
}

export interface PaymentOverdueEvent extends BaseEvent {
  type: "PAYMENT_OVERDUE";
  entityType: "invoice";
  data: {
    invoiceId: string;
    customerId: string;
    amount: number;
    daysPastDue: number;
  };
}

// ── Cargo Events ──

export interface CargoReleasedEvent extends BaseEvent {
  type: "CARGO_RELEASED";
  entityType: "delivery_order";
  data: {
    deliveryOrderId: string;
    bookingId: string;
    consigneeId: string;
    containerNumbers: string[];
  };
}

export interface CargoClaimFiledEvent extends BaseEvent {
  type: "CARGO_CLAIM_FILED";
  entityType: "cargo_claim";
  data: {
    claimId: string;
    bookingId: string;
    claimType: string;
    estimatedValue: number;
  };
}

// ── Approval Events ──

export interface ApprovalRequestedEvent extends BaseEvent {
  type: "APPROVAL_REQUESTED";
  entityType: "approval";
  data: {
    approvalType: string;
    requestedById: string;
    assignedToId: string;
    referenceId: string;
    referenceType: string;
  };
}

export interface ApprovalDecidedEvent extends BaseEvent {
  type: "APPROVAL_DECIDED";
  entityType: "approval";
  data: {
    approvalType: string;
    decidedById: string;
    decision: "approved" | "rejected";
    referenceId: string;
    referenceType: string;
    comment?: string;
  };
}

// ── Sales & CRM Events ──

export interface LeadCreatedEvent extends BaseEvent {
  type: "LEAD_CREATED";
  entityType: "lead";
  data: {
    companyName: string;
    contactName: string;
    source: string;
    tradeLane?: string;
    estimatedTeu?: number;
  };
}

export interface LeadQualifiedEvent extends BaseEvent {
  type: "LEAD_QUALIFIED";
  entityType: "lead";
  data: {
    companyName: string;
    qualificationScore: number;
    assignedTo?: string;
  };
}

export interface LeadConvertedEvent extends BaseEvent {
  type: "LEAD_CONVERTED";
  entityType: "lead";
  data: {
    companyName: string;
    customerId: string;
  };
}

export interface OpportunityCreatedEvent extends BaseEvent {
  type: "OPPORTUNITY_CREATED";
  entityType: "opportunity";
  data: {
    opportunityName: string;
    customerId: string;
    expectedRevenue?: number;
    tradeLane?: string;
  };
}

export interface OpportunityWonEvent extends BaseEvent {
  type: "OPPORTUNITY_WON";
  entityType: "opportunity";
  data: {
    opportunityName: string;
    customerId: string;
    expectedRevenue?: number;
  };
}

export interface OpportunityLostEvent extends BaseEvent {
  type: "OPPORTUNITY_LOST";
  entityType: "opportunity";
  data: {
    opportunityName: string;
    customerId: string;
    lostReason?: string;
    competitorName?: string;
  };
}

export interface QuotationCreatedEvent extends BaseEvent {
  type: "QUOTATION_CREATED";
  entityType: "rate_quotation";
  data: {
    quotationNumber: string;
    customerId: string;
    originPort: string;
    destinationPort: string;
    totalAmount?: number;
  };
}

export interface QuotationApprovedEvent extends BaseEvent {
  type: "QUOTATION_APPROVED";
  entityType: "rate_quotation";
  data: {
    quotationNumber: string;
    customerId: string;
    approvedBy: string;
  };
}

export interface QuotationAcceptedEvent extends BaseEvent {
  type: "QUOTATION_ACCEPTED";
  entityType: "rate_quotation";
  data: {
    quotationNumber: string;
    customerId: string;
    opportunityId?: string;
  };
}

export interface ContractCreatedEvent extends BaseEvent {
  type: "CONTRACT_CREATED";
  entityType: "contract";
  data: {
    contractNumber: string;
    contractName: string;
    customerId: string;
    contractType: string;
  };
}

export interface ContractActivatedEvent extends BaseEvent {
  type: "CONTRACT_ACTIVATED";
  entityType: "contract";
  data: {
    contractNumber: string;
    contractName: string;
    customerId: string;
    startDate: string;
    endDate: string;
  };
}

export interface CustomerCreatedEvent extends BaseEvent {
  type: "CUSTOMER_CREATED";
  entityType: "customer";
  data: {
    customerCode: string;
    companyName: string;
    customerType: string;
    country: string;
  };
}

// ── Union Type ──

export type DomainEvent =
  | BookingCreatedEvent
  | BookingConfirmedEvent
  | BookingCancelledEvent
  | BlIssuedEvent
  | BlSurrenderedEvent
  | ContainerGateInEvent
  | ContainerGateOutEvent
  | ContainerDamagedEvent
  | VesselArrivalEvent
  | VesselDepartureEvent
  | VoyageCompletedEvent
  | CustomsClearedEvent
  | CustomsHeldEvent
  | InvoiceGeneratedEvent
  | PaymentReceivedEvent
  | PaymentOverdueEvent
  | CargoReleasedEvent
  | CargoClaimFiledEvent
  | ApprovalRequestedEvent
  | ApprovalDecidedEvent
  | LeadCreatedEvent
  | LeadQualifiedEvent
  | LeadConvertedEvent
  | OpportunityCreatedEvent
  | OpportunityWonEvent
  | OpportunityLostEvent
  | QuotationCreatedEvent
  | QuotationApprovedEvent
  | QuotationAcceptedEvent
  | ContractCreatedEvent
  | ContractActivatedEvent
  | CustomerCreatedEvent;

export type EventType = DomainEvent["type"];

/** Extract the event shape for a given event type */
export type EventOfType<T extends EventType> = Extract<DomainEvent, { type: T }>;
