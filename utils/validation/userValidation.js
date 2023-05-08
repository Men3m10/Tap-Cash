const { check, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const validation = require("../../middlewares/validator");

const User = require("../../models/userModel");

exports.createUserValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("User name is required ")
    .trim()
    .isLength({ min: 3 })
    .withMessage("too short User name "),

  check("lastName")
    .notEmpty()
    .withMessage("User name is required ")
    .trim()
    .isLength({ min: 3 })
    .withMessage("too short User name "),

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

  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("invalid phone number"),
  check("role").optional(),

  check("userImg").optional(),

  validation,
];

exports.getUserValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  body("name").optional(),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("invalid phone number"),
  check("role").optional(),

  check("userImg").optional(),
  check("email")
    .optional()
    .isEmail()
    .withMessage("inValid Email")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error(`email already exist`));
        }
      })
    ),
  validation,
];

exports.updateLoggedUserValidator = [
  body("name").optional(),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("invalid phone number"),

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
  validation,
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("please enter your current password"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("please entre your password confirm"),
  check("password")
    .notEmpty()
    .withMessage("please enter your new Password")
    .custom(async (val, { req }) => {
      //1)verify current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("can not find a user with this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("current password you entered is wrong!");
      }
      //20verify password confirm
      // eslint-disable-next-line eqeqeq
      if (val != req.body.passwordConfirm) {
        throw new Error("password confirmation is inCorrect");
      }
      return true;
    }),
  validation,
];

exports.changeLoggedPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("please enter your current password"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("please entre your password confirm"),
  check("password")
    .notEmpty()
    .withMessage("please enter your new Password")
    .custom(async (val, { req }) => {
      //1)verify current password
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new Error("can not find a user with this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("current password you entered is wrong!");
      }
      //20verify password confirm
      // eslint-disable-next-line eqeqeq
      if (val != req.body.passwordConfirm) {
        throw new Error("password confirmation is inCorrect");
      }
      return true;
    }),
  validation,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("invalid User id format"),
  validation,
];
