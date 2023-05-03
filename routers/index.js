const userRoute = require("./userRoutes");
const authRoute = require("./authRoutes");
const requestRoute = require("./requestRoutes");
const transactionRoute = require("./transactionRoutes");
const walletRoute = require("./walletRoutes");

const Routes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/request", requestRoute);
  app.use("/api/v1/transaction", transactionRoute);
  app.use("/api/v1/wallet", walletRoute);
};

module.exports = Routes;
