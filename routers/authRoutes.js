const express = require("express");

const Router = express.Router();


const {
  signUp,
  login,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/authController");

Router.post("/signup", signUp);
Router.post("/login", login);
Router.post("/forgetPassword", forgetPassword);
Router.post("/verify", verifyResetCode);
Router.put("/resetPassword", resetPassword);

module.exports = Router;
