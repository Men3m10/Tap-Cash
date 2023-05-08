const userRoute = require("./userRoutes");
const authRoute = require("./authRoutes");
const visaRoute = require("./visaRoutes");
const transactionRoute = require("./transactionRoutes");
const walletRoute = require("./walletRoutes");

const Routes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/visa", visaRoute);
  app.use("/api/v1/transaction", transactionRoute);
  app.use("/api/v1/wallet", walletRoute);
};

module.exports = Routes;
