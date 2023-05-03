const express = require("express");

const Router = express.Router();

const {
  signupValidator,
  loginValidator,
} = require("../utils/validation/authValidation");

const {
  signUp,
  login,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/authController");

Router.post("/signup", signupValidator, signUp);
Router.post("/login", loginValidator, login);
Router.post("/forgetPassword", forgetPassword);
Router.post("/verify", verifyResetCode);
Router.put("/resetPassword", resetPassword);

module.exports = Router;
