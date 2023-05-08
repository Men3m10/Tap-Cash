const express = require("express");

const Router = express.Router();
const auth = require("../controllers/authController");

const {
  createVisa,
  payByVisa,
  checkExpiredVisa,
} = require("../controllers/visaController");

//for all routes under
Router.use(auth.Protect);
Router.use(auth.allowedTo("parent", "child"));
Router.post("/create", createVisa);
Router.post("/pay", checkExpiredVisa, payByVisa);

// Router.get("/", getRequests);
// Router.get("/:id", getRequestValidator, getRequestById);
// Router.put("/:id", updateRequestById);
// Router.delete("/:id", deleteRequestValidator, deleteRequestById);

module.exports = Router;
