const express = require("express");

const Router = express.Router();
const auth = require("../controllers/authController");

const {
  deleteWalletValidator,
  getWalletValidator,
} = require("../utils/validation/walletValidation");

const {
  deleteWalletById,
  getWalletById,
  getWallets,
  updateWalletById,
} = require("../controllers/walletController");

// //for all routes under
// Router.use(auth.Protect);
Router.use(auth.allowedTo("parent", "child"));

Router.get("/", getWallets);
Router.get("/:id", getWalletValidator, getWalletById);
Router.put("/:id", updateWalletById);
Router.delete("/:id", deleteWalletValidator, deleteWalletById);

module.exports = Router;
