const express = require("express");

const Router = express.Router();
const auth = require("../controllers/authController");

const {
  createVisa,
  payByVisa,
  checkExpiredVisa,
  refundBalanceFromExpired,
  updateBalanceByVisa,
} = require("../controllers/visaController");

//for all routes under
Router.use(auth.Protect);
Router.use(auth.allowedTo("parent", "child"));
Router.post("/create", createVisa);
Router.post("/pay", checkExpiredVisa, payByVisa);
Router.post("/refund", refundBalanceFromExpired);
Router.post("/addBalanceToWallet", checkExpiredVisa, updateBalanceByVisa);

module.exports = Router;
