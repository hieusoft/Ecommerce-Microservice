module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Product Service API",
    version: "1.0.0",
    description: "API documentation for Product Service (Node.js + MongoDB) with Base64 image upload and JWT Authorization",
  },
  servers: [
    { url: "http://localhost:8082", description: "Local server" }
  ],

  paths: {

    /* -------------------- BOUQUETS -------------------- */
    "/api/bouquets": {
      get: {
        tags: ["Bouquet"],
        summary: "Get all bouquets or search with filters",
        parameters: [
          { name: "search_query", in: "query", schema: { type: "string" }, description: "Search bouquet name or occasion name" },
          { name: "name", in: "query", schema: { type: "string" }, description: "Bouquet name" },
          { name: "occasionName", in: "query", schema: { type: "string" }, description: "Occasion name" },
          { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum bouquet price" },
          { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum bouquet price" },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" }, description: "Bouquet created after this date" },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" }, description: "Bouquet created before this date" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Items per page" },
          { name: "sortBy", in: "query", schema: { type: "string", default: "createdAt" }, description: "Sort field" },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" }, description: "Sort order" }
        ],
        responses: {
          200: {
            description: "Paginated list of bouquets",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    totalItems: { type: "integer" },
                    totalPages: { type: "integer" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Bouquet" } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Bouquet"],
        summary: "Create a new bouquet (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } }
        },
        responses: {
          201: { description: "Bouquet created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" }
        }
      }
    },

    "/api/bouquets/{id}": {
      get: {
        tags: ["Bouquet"],
        summary: "Get bouquet by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Bouquet object", content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } } },
          401: { description: "Unauthorized" },
          404: { description: "Not found" }
        }
      },
      put: {
        tags: ["Bouquet"],
        summary: "Update bouquet by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } } },
        responses: {
          200: { description: "Bouquet updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      },
      delete: {
        tags: ["Bouquet"],
        summary: "Delete bouquet by ID (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Bouquet deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" }
        }
      }
    },

    /* -------------------- OCCASIONS -------------------- */
    "/api/occasions": {
      get: { tags: ["Occasion"], summary: "Get all occasions", responses: { 200: { description: "List" } } },
      post: {
        tags: ["Occasion"],
        summary: "Create occasion",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Occasion" } } } },
        responses: { 201: { description: "Created" } }
      }
    },
    "/api/occasions/{id}": {
      get: { tags: ["Occasion"], summary: "Get occasion by ID", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Object" } } },
      put: { tags: ["Occasion"], summary: "Update occasion", parameters: [{ name: "id", in: "path", required: true }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Occasion" } } } } },
      delete: { tags: ["Occasion"], summary: "Delete occasion", parameters: [{ name: "id", in: "path", required: true }] }
    },

    /* -------------------- GREETINGS -------------------- */
    "/api/greetings": {
      get: { tags: ["Greeting"], summary: "Get all greetings", responses: { 200: { description: "List" } } },
      post: {
        tags: ["Greeting"],
        summary: "Create greeting",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Greeting" } } } }
      }
    },
    "/api/greetings/{id}": {
      get: { tags: ["Greeting"], summary: "Get greeting by ID", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Object" } } },
      put: { tags: ["Greeting"], summary: "Update greeting", parameters: [{ name: "id", in: "path", required: true }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Greeting" } } } } },
      delete: { tags: ["Greeting"], summary: "Delete greeting", parameters: [{ name: "id", in: "path", required: true }] }
    }
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },

    schemas: {
      Bouquet: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          occasionId: { type: "string" },
          images: {
            type: "array",
            items: { type: "string", format: "byte" }
          }
        },
        required: ["name", "price"]
      },

      Occasion: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        }
      },

      Greeting: {
        type: "object",
        properties: {
          text: { type: "string" },
          occasionId: { type: "string" }
        },
        required: ["text"]
      }
    }
  }
};
