const express = require("express");

const Router = express.Router();
const auth = require("../controllers/authController");

const {
  createTransactionValidation,
  deleteTransactionValidator,
  getTransactionValidator,
} = require("../utils/validation/transactionValidation");

const {
  createTransaction,
  deleteTransactionById,
  getTransactionById,
  getTransactions,
  updateTransactionById,

  getLoggedUserTransactions,
  getUserTransaction,
  approvingTransaction,
} = require("../controllers/transactionController");

//for all routes under
Router.use(auth.Protect);
Router.use(auth.allowedTo("parent", "child"));

Router.get("/getMyTransactions", getLoggedUserTransactions, getUserTransaction);

Router.post("/create", createTransactionValidation, createTransaction);
Router.post("/approve/:id", approvingTransaction);
Router.get("/", getTransactions);
Router.get("/:id", getTransactionValidator, getTransactionById);
Router.put("/:id", updateTransactionById);

Router.delete("/:id", deleteTransactionValidator, deleteTransactionById);

module.exports = Router;
