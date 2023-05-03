const { check, body } = require("express-validator");
const validation = require("../../middlewares/validator");

exports.getWalletValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];

exports.deleteWalletValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];
