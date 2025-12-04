const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swaggerDefinition");

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get("/api-docs.json", (req, res) => res.json(swaggerDocument));
  console.log("Swagger docs available at: /api-docs");
}

module.exports = swaggerDocs;
