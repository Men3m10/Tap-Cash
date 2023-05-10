const Validator = require("validator");
const isEmpty = require("../is-empty");

const validateSignup = (data) => {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmPassword = !isEmpty(data.confirmPassword)
    ? data.confirmPassword
    : "";
  data.ssid = !isEmpty(data.ssid) ? data.ssid : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";

  if (!Validator.isLength(data.name, { min: 3, max: 20 })) {
    errors = "Name must be between 3 and 30 characters";
  }

  if (Validator.isEmpty(data.name)) {
    errors = "Name  is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors = "email  is required";
  }
  if (Validator.isEmpty(data.phone)) {
    errors = "phone  is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors = "password  is required";
  }

  if (data.confirmPassword !== data.password) {
    errors = "confirm password not equal password";
  }
  if (!Validator.isLength(data.password, { min: 6 })) {
    errors = "Name must be between 6";
  }
  if (!Validator.isLength(data.ssid, { min: 14, max: 14 })) {
    errors = "National Id must be 14 char";
  }

  if (Validator.isEmpty(data.confirmPassword)) {
    errors = "Confirm Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

const validateLogin = (data) => {
  let errors = {};
  data.ssid = !isEmpty(data.ssid) ? data.ssid : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!Validator.isLength(data.ssid, { min: 14, max: 14 })) {
    errors = "national id must be of 14 characters";
  }

  if (Validator.isEmpty(data.ssid)) {
    errors = "national id is required";
  }
  if (Validator.isEmpty(data.password)) {
    errors = "Password  is required";
  }

  if (!Validator.isLength(data.password, { min: 8, max: 30 })) {
    errors = "Password must contain at least 8 character";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
module.exports = { validateSignup, validateLogin };
