import { NextResponse } from "next/server";

/**
 * GET /api/docs
 *
 * ERP-122: OpenAPI 3.0 specification for the CS-ERP API.
 * Public endpoint (no auth required). Returns JSON spec
 * documenting key API endpoints.
 */
export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "CS-ERP API",
      description:
        "AI-First Container Shipping ERP — REST API for managing bookings, vessels, customers, documents, and more.",
      version: "1.0.0",
      contact: {
        name: "Codilla Support",
        url: "https://cs-erp.codilla.ai",
      },
    },
    servers: [
      {
        url: "https://cs-erp.codilla.ai",
        description: "Production",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "cs_access_token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: { type: "object" },
              },
              required: ["code", "message"],
            },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            cursor: { type: "string", nullable: true },
            hasMore: { type: "boolean" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "tenantName"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 12 },
            tenantName: { type: "string", minLength: 2, maxLength: 255 },
            displayName: { type: "string", maxLength: 255 },
            country: { type: "string", enum: ["QA", "AE", "SA", "IN"] },
            timezone: { type: "string", maxLength: 50 },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            tenantId: { type: "string", format: "uuid" },
            role: { type: "string" },
          },
        },
        Port: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            tenantId: { type: "string", format: "uuid" },
            portCode: { type: "string" },
            portName: { type: "string" },
            country: { type: "string" },
            timezone: { type: "string" },
            status: { type: "string" },
          },
        },
        Vessel: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            tenantId: { type: "string", format: "uuid" },
            vesselName: { type: "string" },
            imoNumber: { type: "string" },
            vesselType: { type: "string" },
            flag: { type: "string" },
            status: { type: "string" },
          },
        },
        Customer: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            tenantId: { type: "string", format: "uuid" },
            customerName: { type: "string" },
            customerCode: { type: "string" },
            email: { type: "string", format: "email" },
            status: { type: "string" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            tenantId: { type: "string", format: "uuid" },
            bookingRef: { type: "string" },
            customerName: { type: "string" },
            originPort: { type: "string" },
            destinationPort: { type: "string" },
            containerCount: { type: "integer" },
            status: { type: "string" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            channel: { type: "string" },
            subject: { type: "string" },
            status: { type: "string" },
            sentAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }, { CookieAuth: [] }],
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/AuthUser" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user and tenant",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Registration successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/AuthUser" },
                    },
                  },
                },
              },
            },
            "409": {
              description: "Email already registered",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout and invalidate tokens",
          responses: {
            "200": { description: "Logout successful" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current authenticated user",
          responses: {
            "200": {
              description: "Current user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/AuthUser" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/v1/master-data-management": {
        get: {
          tags: ["Master Data"],
          summary: "List master data records (ports, vessels, customers, etc.)",
          parameters: [
            {
              name: "cursor",
              in: "query",
              schema: { type: "string" },
              description: "Pagination cursor",
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 50, maximum: 50 },
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string" },
              description: "Search by name or code",
            },
          ],
          responses: {
            "200": {
              description: "Paginated list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { type: "object" } },
                      meta: { $ref: "#/components/schemas/PaginationMeta" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/customer-portal": {
        get: {
          tags: ["Bookings"],
          summary: "List bookings (portal)",
          parameters: [
            {
              name: "cursor",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "status",
              in: "query",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Paginated bookings",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Booking" },
                      },
                      meta: { $ref: "#/components/schemas/PaginationMeta" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/workflow-notification-engine": {
        get: {
          tags: ["Notifications"],
          summary: "List notification records",
          parameters: [
            {
              name: "cursor",
              in: "query",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Paginated notifications",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Notification" },
                      },
                      meta: { $ref: "#/components/schemas/PaginationMeta" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/admin-portal/export": {
        post: {
          tags: ["Import/Export"],
          summary: "Export data as CSV/XLSX",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    module: { type: "string" },
                    format: { type: "string", enum: ["csv", "xlsx"] },
                    filters: { type: "object" },
                  },
                  required: ["module", "format"],
                },
              },
            },
          },
          responses: {
            "201": { description: "Export job queued" },
          },
        },
      },
      "/api/v1/admin-portal/import": {
        post: {
          tags: ["Import/Export"],
          summary: "Import data from CSV/XLSX",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary" },
                    module: { type: "string" },
                  },
                  required: ["file", "module"],
                },
              },
            },
          },
          responses: {
            "201": { description: "Import job queued" },
          },
        },
      },
      "/api/v1/admin-portal/audit-trail": {
        get: {
          tags: ["Audit"],
          summary: "Get field-level change history for an entity",
          parameters: [
            {
              name: "entityType",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "entityId",
              in: "query",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
            {
              name: "cursor",
              in: "query",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Change history",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            userId: { type: "string", format: "uuid" },
                            field: { type: "string" },
                            oldValue: {},
                            newValue: {},
                            changedAt: {
                              type: "string",
                              format: "date-time",
                            },
                          },
                        },
                      },
                      meta: { $ref: "#/components/schemas/PaginationMeta" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/audit-compliance-management/sanctions-screen": {
        post: {
          tags: ["Compliance"],
          summary: "Screen an entity against sanctions lists",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", minLength: 1 },
                    entityType: {
                      type: "string",
                      enum: ["individual", "organization"],
                    },
                  },
                  required: ["name", "entityType"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Screening result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          screened: { type: "boolean" },
                          status: {
                            type: "string",
                            enum: ["clear", "potential_match", "match"],
                          },
                          matches: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                listName: { type: "string" },
                                matchedName: { type: "string" },
                                score: { type: "number" },
                                listId: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication and session management" },
      { name: "Master Data", description: "Ports, vessels, customers, and lookups" },
      { name: "Bookings", description: "Container booking management" },
      { name: "Notifications", description: "Notification engine" },
      { name: "Import/Export", description: "Data import and export operations" },
      { name: "Audit", description: "Audit trail and compliance" },
      { name: "Compliance", description: "Sanctions screening and regulatory compliance" },
    ],
  };

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
