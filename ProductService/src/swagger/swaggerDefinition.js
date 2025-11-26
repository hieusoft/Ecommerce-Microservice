module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Product Service API",
    version: "1.0.0",
    description: "API documentation for Product Service (Node.js + MongoDB) with Base64 image upload",
  },
  servers: [
    { url: "http://localhost:5000", description: "Local server" }
  ],

  paths: {
    /* -------------------- BOUQUETS -------------------- */
    "/api/bouquets/results": {
      get: {
        tags: ["Bouquet"],
        summary: "Search bouquets with multiple filters",
        parameters: [
          { name: "search_query", in: "query", schema: { type: "string" }, description: "Search term (name, flower name/color, occasion name)" },
          { name: "name", in: "query", schema: { type: "string" }, description: "Bouquet name" },
          { name: "flowerName", in: "query", schema: { type: "string" }, description: "Flower name in bouquet" },
          { name: "flowerColor", in: "query", schema: { type: "string" }, description: "Flower color" },
          { name: "flowerMinPrice", in: "query", schema: { type: "number" }, description: "Minimum flower price" },
          { name: "flowerMaxPrice", in: "query", schema: { type: "number" }, description: "Maximum flower price" },
          { name: "occasionName", in: "query", schema: { type: "string" }, description: "Occasion name" },
          { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum bouquet price" },
          { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum bouquet price" },
          { name: "minFlowerQuantity", in: "query", schema: { type: "number" }, description: "Minimum quantity of flower in bouquet" },
          { name: "maxFlowerQuantity", in: "query", schema: { type: "number" }, description: "Maximum quantity of flower in bouquet" },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" }, description: "Bouquet created after this date" },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" }, description: "Bouquet created before this date" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number for pagination" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 }, description: "Number of items per page" },
          { name: "sortBy", in: "query", schema: { type: "string", default: "createdAt" }, description: "Field to sort by" },
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
      }
    },

    "/api/bouquets": {
      get: {
        tags: ["Bouquet"],
        summary: "Get all bouquets",
        responses: { 200: { description: "List of bouquets", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Bouquet" } } } } } }
      },
      post: {
        tags: ["Bouquet"],
        summary: "Create a new bouquet",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } }
          }
        },
        responses: { 201: { description: "Bouquet created", content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } } } }
      }
    },

    "/api/bouquets/{id}": {
      get: {
        tags: ["Bouquet"],
        summary: "Get bouquet by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Bouquet object", content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } } }, 404: { description: "Not found" } }
      },
      put: {
        tags: ["Bouquet"],
        summary: "Update bouquet by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } } },
        responses: { 200: { description: "Bouquet updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } } }, 404: { description: "Not found" } }
      },
      delete: {
        tags: ["Bouquet"],
        summary: "Delete bouquet by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Bouquet deleted" }, 404: { description: "Not found" } }
      }
    },

    /* -------------------- FLOWERS -------------------- */
    "/api/flowers": {
      get: { tags: ["Flower"], summary: "Get all flowers", responses: { 200: { description: "List of flowers" } } },
      post: { tags: ["Flower"], summary: "Create flower", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Flower" } } } }, responses: { 201: { description: "Flower created" } } }
    },
    "/api/flowers/{id}": {
      get: { tags: ["Flower"], summary: "Get flower by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Flower object" }, 404: { description: "Not found" } } },
      put: { tags: ["Flower"], summary: "Update flower", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Flower" } } } }, responses: { 200: { description: "Flower updated" }, 404: { description: "Not found" } } },
      delete: { tags: ["Flower"], summary: "Delete flower", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Flower deleted" }, 404: { description: "Not found" } } }
    },

    /* -------------------- OCCASIONS -------------------- */
    "/api/occasions": {
      get: { tags: ["Occasion"], summary: "Get all occasions", responses: { 200: { description: "List of occasions" } } },
      post: { tags: ["Occasion"], summary: "Create occasion", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Occasion" } } } }, responses: { 201: { description: "Occasion created" } } }
    },
    "/api/occasions/{id}": {
      get: { tags: ["Occasion"], summary: "Get occasion by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Occasion object" }, 404: { description: "Not found" } } },
      put: { tags: ["Occasion"], summary: "Update occasion", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Occasion" } } } }, responses: { 200: { description: "Occasion updated" } } },
      delete: { tags: ["Occasion"], summary: "Delete occasion", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Occasion deleted" } } }
    },

    /* -------------------- GREETINGS -------------------- */
    "/api/greetings": {
      get: { tags: ["Greeting"], summary: "Get all greetings", responses: { 200: { description: "List of greetings" } } },
      post: { tags: ["Greeting"], summary: "Create greeting", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Greeting" } } } }, responses: { 201: { description: "Greeting created" } } }
    },
    "/api/greetings/{id}": {
      get: { tags: ["Greeting"], summary: "Get greeting by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Greeting object" }, 404: { description: "Not found" } } },
      put: { tags: ["Greeting"], summary: "Update greeting", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Greeting" } } } }, responses: { 200: { description: "Greeting updated" } } },
      delete: { tags: ["Greeting"], summary: "Delete greeting", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Greeting deleted" } } }
    }
  },

  components: {
    schemas: {
      FlowerRef: {
        type: "object",
        properties: { flowerId: { type: "string" }, quantity: { type: "number" } }
      },
      Bouquet: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          occasionId: { type: "string" },
          flowers: { type: "array", items: { $ref: "#/components/schemas/FlowerRef" } },
          images: { type: "array", items: { type: "string", format: "byte" }, description: "List of images in Base64 format" }
        },
        required: ["name", "price"]
      },
      Flower: {
        type: "object",
        properties: {
          name: { type: "string" },
          color: { type: "string" },
          price: { type: "number" },
          images: {
            type: "array",
            items: { type: "string", format: "byte" },
            description: "List of images for flower (Base64 format)"
          }
        },
        required: ["name", "price"]
      },

      Occasion: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } },
      Greeting: { type: "object", properties: { text: { type: "string" }, occasionId: { type: "string" } }, required: ["text"] }
    }
  }
};
