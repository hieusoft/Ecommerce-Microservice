module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Product Service API",
    version: "1.0.0",
    description: "API documentation for Product Service (Node.js + MongoDB)"
  },
  servers: [
    { url: "http://localhost:8082", description: "Local server" }
  ],

  paths: {

    /* =====================================================
     *                    BOUQUETS
     * ===================================================== */
    "/api/bouquets": {
      get: {
        tags: ["Bouquet"],
        summary: "Get all bouquets (filters + pagination + sorting)",
        parameters: [
          { name: "search_query", in: "query", schema: { type: "string" } },
          { name: "name", in: "query", schema: { type: "string" } },

          {
            name: "subOccasionId",
            in: "query",
            schema: { type: "string" },
            description: "Filter by Sub Occasion ID"
          },

          {
            name: "subOccasionName",
            in: "query",
            schema: { type: "string" },
            description: "Filter by Sub Occasion Name"
          },

          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },

          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" }
          },

          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" }
          },

          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 }
          },

          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 }
          },

          {
            name: "sortOption",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "priceAsc",
                "priceDesc",
                "nameAsc",
                "nameDesc",
                "newest",
                "oldest"
              ]
            },
            description: "Sort bouquets"
          }
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
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bouquet" }
                    }
                  }
                }
              }
            }
          }
        }
      },

      post: {
        tags: ["Bouquet"],
        summary: "Create new bouquet (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Bouquet" },
              example: {
                name: "Roses Bouquet",
                description: "Beautiful red roses",
                price: 20,
                subOccasionId: "693080b40071ae7e104e3dcf",
                images: ["image1.png", "image2.png"]
              }
            }
          }
        },
        responses: {
          201: { description: "Bouquet created" }
        }
      }
    },
    "/api/bouquets/{id}": {
      get: {
        tags: ["Bouquet"],
        summary: "Get bouquet by ID",
        parameters: [{ name: "id", in: "path", schema: { type: "string" }, required: true }],
        responses: {
          200: { description: "Bouquet object", content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } } },
          404: { description: "Not found" }
        }
      },
      put: {
        tags: ["Bouquet"],
        summary: "Update bouquet (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", schema: { type: "string" }, required: true }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Bouquet" } } }
        },
        responses: { 200: { description: "Bouquet updated" }, 404: { description: "Not found" } }
      },
      delete: {
        tags: ["Bouquet"],
        summary: "Delete bouquet (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", schema: { type: "string" }, required: true }],
        responses: { 200: { description: "Bouquet deleted" }, 404: { description: "Not found" } }
      }
    },


    /* =====================================================
     *                    OCCASIONS
     * ===================================================== */
    "/api/occasions": {
      get: {
        tags: ["Occasion"],
        summary: "Get all occasions",
        responses: {
          200: {
            description: "List of occasions",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Occasion" } } } }
          }
        }
      },
      post: {
        tags: ["Occasion"],
        summary: "Create occasion",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Occasion" } } }
        },
        responses: { 201: { description: "Created" } }
      }
    },


    "/api/occasions/{id}": {
      get: {
        tags: ["Occasion"],
        summary: "Get occasion by ID or name",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Keyword hoặc ID",
            example: "Love-&-Romance",
          }
        ],
        responses: {
          200: {
            description: "Occasion object",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Occasion" }
              }
            }
          },
          404: { description: "Not found" }
        }
      },


      put: {
        tags: ["Occasion"],
        summary: "Update occasion",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Occasion" } } } },
        responses: { 200: { description: "Updated" } }
      },
      delete: {
        tags: ["Occasion"],
        summary: "Delete occasion",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true }],
        responses: { 200: { description: "Deleted" } }
      }
    },


    /* =====================================================
     *                  SUB OCCASIONS
     * ===================================================== */
    "/api/suboccasions": {
      get: {
        tags: ["SubOccasion"],
        summary: "Get all sub occasions",
        responses: {
          200: {
            description: "List of sub-occasions",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/SubOccasion" } } } }
          }
        }
      },
      post: {
        tags: ["SubOccasion"],
        summary: "Create sub occasion",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SubOccasion" } } } },
        responses: { 201: { description: "Created" } }
      }
    },

    "/api/suboccasions/{id}": {
      get: {
        tags: ["SubOccasion"],
        summary: "Get sub occasion by ID",
        parameters: [{ name: "id", in: "path", required: true }],
        responses: {
          200: { description: "Sub occasion object", content: { "application/json": { schema: { $ref: "#/components/schemas/SubOccasion" } } } },
          404: { description: "Not found" }
        }
      },
      put: {
        tags: ["SubOccasion"],
        summary: "Update sub occasion",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SubOccasion" } } } },
        responses: { 200: { description: "Updated" } }
      },
      delete: {
        tags: ["SubOccasion"],
        summary: "Delete sub occasion",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true }],
        responses: { 200: { description: "Deleted" } }
      }
    },


    /* =====================================================
     *                    GREETINGS
     * ===================================================== */
    "/api/greetings": {
      get: {
        tags: ["Greeting"],
        summary: "Get all greetings",
        responses: {
          200: {
            description: "List of greetings",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Greeting" } } } }
          }
        }
      },
      post: {
        tags: ["Greeting"],
        summary: "Create greeting",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Greeting" } } } },
        responses: { 201: { description: "Created" } }
      }
    },

    "/api/greetings/{id}": {
      get: {
        tags: ["Greeting"],
        summary: "Get greeting by ID",
        parameters: [{ name: "id", in: "path", required: true }],
        responses: {
          200: { description: "Greeting object", content: { "application/json": { schema: { $ref: "#/components/schemas/Greeting" } } } },
          404: { description: "Not found" }
        }
      },
      put: {
        tags: ["Greeting"],
        summary: "Update greeting",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Greeting" } } } },
        responses: { 200: { description: "Updated" } }
      },
      delete: {
        tags: ["Greeting"],
        summary: "Delete greeting",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true }],
        responses: { 200: { description: "Deleted" } }
      }
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
          subOccasionId: { type: "string" },
          images: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        },
        required: ["name", "price", "subOccasionId"]
      },
      Occasion: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        },
        required: ["name"]
      },
      SubOccasion: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          occasionId: { type: "string" }
        },
        required: ["name", "occasionId"]
      },
      Greeting: {
        type: "object",
        properties: {
          text: { type: "string" },
          subOccasionId: { type: "string" }
        },
        required: ["text"]
      }
    }
  }
};