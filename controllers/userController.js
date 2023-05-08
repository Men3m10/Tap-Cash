const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiErr = require("../utils/apiError");
const generateToken = require("../utils/createToken");

const User = require("../models/userModel");
///////////////////////////////////////////////////////

module.exports = {
  //=======================================================================================
  getUserById: asyncHandler(async (req, res, next) => {
    // get the user id from the request params
    const { id } = req.params;

    // find the user by id in the database and populate their wallet and children fields
    const user = await User.findById(id)
      .populate("wallet")
      .populate("children")
      .populate("transactions");
    // check if the user exists
    if (!user) {
      return res.json({ message: "User not found" });
    }
    // send back the user data as a response
    res.status(200).json(user);
  }),
  deleteUserById: asyncHandler(async (req, res, next) => {
    // get the user id from the request params
    const { id } = req.params;
    // find and delete the user by id in the database
    const deletedUser = await User.findByIdAndDelete(id);
    // check if the user exists
    if (!deletedUser) {
      return res.json({ message: "User not found" });
    }
    // send back a success message as a response
    res.status(200).json({ message: "User deleted successfully" });
  }),
  updateUser: asyncHandler(async (req, res, next) => {
    // find and update the user by id in the databas
    const document = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return res.json({ message: "no user with this id" });
    }

    res.status(200).json({ data: document });
  }),
  //@desc    update specific User by id
  //route     PUT /api/v1/Users/:id
  //access    private

  updateUserPassword: asyncHandler(async (req, res, next) => {
    const document = await User.findByIdAndUpdate(
      req.params.id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );
    if (!document) {
      return res.json({ message: "no user with this id" });
    }

    res.status(200).json({ data: document });
  }),
  //@desc    update specific UserPassword by id
  //route     PUT /api/v1/Users/:id
  //access    private

  getLoggedUserData: asyncHandler(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
  }),
  //@desc     get logged user data
  //route     GET /api/v1/Users/getMyData
  //access    private/protect

  updateLoggedUserPassword: asyncHandler(async (req, res, next) => {
    //1)update logged user passwored based on payload(user._id) from protect route
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );
    if (!user) {
      return res.json({ message: "no user with this id" });
    }

    //2) generate token
    const token = generateToken(user._id);

    res.status(200).json({ data: user, token });
  }),
  //@desc    update specific loggedUserPassword by id  user_id
  //route     PUT /api/v1/Users/updateMyPassword
  //access    private/Protect

  updateLoggedUserData: asyncHandler(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        email: req.body.email,
        phone: req.body.phone,
        name: req.body.name,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Data Updated Succesfully", data: updatedUser });
  }),
  //@desc    update specific LoggedUserData by id   user_id  (without password , role)
  //route     PUT /api/v1/Users/updateMyData
  //access    private/Protect
};
