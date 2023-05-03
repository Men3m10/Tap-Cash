const { check, body } = require("express-validator");
const Requests = require("../../models/requestModel");
const validation = require("../../middlewares/validator");

exports.createRequestValidation = [
  check("amount").notEmpty().withMessage("amount is required "),

  check("requester").notEmpty().withMessage("requester is required "),
  check("id").isMongoId().withMessage("invalid requester id format"),
  check("approver").notEmpty().withMessage("approver is required "),
  check("id").isMongoId().withMessage("invalid approver id format"),
  check("reason").notEmpty().withMessage("reason is required "),
];

exports.getRequestValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];

exports.deleteRequestValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];
