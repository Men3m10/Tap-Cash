const { check } = require("express-validator");
const slugify = require("slugify");

const validation = require("../../middlewares/validator");

const User = require("../../models/userModel");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required ")
    .trim()
    .isLength({ min: 3 })
    .withMessage("too short User name ")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("inValid Email")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error(`email already exist`));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("too short Password")
    .custom((password, { req }) => {
      // eslint-disable-next-line eqeqeq
      if (password != req.body.confirmPassword) {
        throw new Error("password confirmation is inCorrect");
      }
      return true;
    }),

  check("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required"),

  validation,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("inValid Email"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("too short Password"),
  validation,
];
