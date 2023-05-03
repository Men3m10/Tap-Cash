const express = require("express");

const Router = express.Router();
const auth = require("../controllers/authController");

const {
  createUserValidator,
  deleteUserValidator,
  getUserValidator,
  updateUserValidator,
  changePasswordValidator,
  changeLoggedPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validation/userValidation");

const {
  uploadBrandImage,
  resizeImage,
  updateUser,
  updateUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deactiveLoggedUserData,
  activeLoggedUserData,
  getUserById,
  deleteUserById,
} = require("../controllers/userController");
////////////////////////////////////////////////////////////////////////////////////
//for all routes under
Router.use(auth.Protect);

// //User
Router.get("/getMyData", getLoggedUserData, getUserById);
Router.put(
  "/changeMyPassword",
  changeLoggedPasswordValidator,
  updateLoggedUserPassword
);
Router.put(
  "/updateMyData",

  updateLoggedUserValidator,
  updateLoggedUserData
);

/////////////////////////////////////////////////////////////////////////////////////
//Admin
//for all routes under
Router.use(auth.allowedTo("parent", "child"));
// Router.post(
//   "/",
//   uploadBrandImage,
//   resizeImage,
//   createUserValidator,
//   createUser
// );
// Router.get("/", getUsers);

Router.get("/:id", getUserValidator, getUserById);

Router.put(
  "/:id",
  uploadBrandImage,
  resizeImage,
  updateUserValidator,
  updateUser
);
Router.put("/changePassword/:id", changePasswordValidator, updateUserPassword);
Router.delete("/:id", deleteUserValidator, deleteUserById);

module.exports = Router;
