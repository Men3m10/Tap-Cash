const { check, body } = require("express-validator");
const validation = require("../../middlewares/validator");

exports.createTransactionValidation = [
  check("amount").notEmpty().withMessage("amount is required "),

  check("sender").notEmpty().withMessage("sender is required "),
  check("id").isMongoId().withMessage("invalid sender id format"),

  check("receiver").notEmpty().withMessage("receiver is required "),
  check("id").isMongoId().withMessage("invalid receiver id format"),

  check("description").notEmpty().withMessage("description is required "),
];

exports.getTransactionValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];

exports.deleteTransactionValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];
