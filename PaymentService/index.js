

const app = require("./src/app");
const { port } = require("./src/config/env");

app.listen(port, () => {
  console.log("Payment Service running on port", port);
});
