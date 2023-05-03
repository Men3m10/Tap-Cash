const express = require("express");

const Router = express.Router();
const auth = require("../controllers/authController");
const request = require("../controllers/requestsController");

const {
  createRequestValidation,
  deleteRequestValidator,
  getRequestValidator,
} = require("../utils/validation/requestValidation");

const {
  createRequest,
  deleteRequestById,
  getRequestById,
  getRequests,
  updateRequestById,
} = require("../controllers/requestsController");

//for all routes under
Router.use(auth.Protect);
Router.use(auth.allowedTo("parent", "child"));
Router.post("/", createRequestValidation, createRequest);
Router.get("/", getRequests);
Router.get("/:id", getRequestValidator, getRequestById);
Router.put("/:id", updateRequestById);
Router.delete("/:id", deleteRequestValidator, deleteRequestById);

module.exports = Router;
