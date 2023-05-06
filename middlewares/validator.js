const { validationResult } = require("express-validator");

const validator = (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((error) => ({ param: error.param, msg: error.msg }));

    return res.status(400).json({ errors: messages });
  }
  next();
};

module.exports = validator;
