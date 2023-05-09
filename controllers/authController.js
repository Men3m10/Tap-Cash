const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/createToken");
const {
  signUpValidation,
  logInValidation,
} = require("../utils/validation/authValidation");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

module.exports = {
  signUp: asyncHandler(async (req, res, next) => {
    //1) get the user data from the request body
    const {
      name,
      email,
      password,
      role,
      ssid,
      phone,
      parent,
      confirmPassword,
    } = req.body;
    signUpValidation(req, res, name, email, password, ssid, confirmPassword);
    // check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already taken" });
    }
    // check if the phone already exists in the database
    const existingUserphone = await User.findOne({ phone });
    if (existingUserphone) {
      return res.json({ message: "phone already taken" });
    }

    // check if the ssid already exists in the database
    const existingUserId = await User.findOne({ ssid });
    if (existingUserId) {
      return res.json({ message: "National Id Already Exists" });
    }

    if (role === "child" && !parent) {
      return res.json({ message: "Parent is required for child" });
    }
    //2)create user
    const user = await User.create({
      name,
      email,
      phone,
      role,
      password,
      ssid,
      children: [],
      transactions: [],
    });

    // If the user is a child, add them to their parent's children array
    if (role === "child") {
      await User.findOneAndUpdate(
        { ssid: parent },
        { $push: { children: user._id } }
      );
    }
    // create a new wallet for the user and assign it to them
    const wallet = await Wallet.create({
      owner: user._id,
    });
    user.wallet = wallet._id;
    await user.save();
    //2-generate token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
        ssid: user.ssid,
        password: user.password,
        phone: user.phone,
        children: user.children,
        transactions: user.transactions,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_KEY_EXPIRED,
      }
    );

    res.status(201).json({
      message: "registered successfully",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
        ssid: user.ssid,
        password: user.password,
        phone: user.phone,
        children: user.children,
        transactions: user.transactions,
      },
      token,
    });
  }),

  login: asyncHandler(async (req, res, next) => {
    //1-check ssid and password is in body ==> in validation
    //2- check ssid is created and password is correct
    // get the user credentials from the request body
    const { ssid, password } = req.body;
    logInValidation(res, password, ssid);
    const user = await User.findOne({ ssid })
      .populate("wallet")
      .populate("transactions");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.json({ message: "national id or password is incorrect" });
    }
    //3- generate token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
        ssid: user.ssid,
        phone: user.phone,
        transactions: user.transactions,
        visa: user.visa,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_KEY_EXPIRED,
      }
    );

    res.status(201).json({
      message: "Logged In",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
        ssid: user.ssid,
        phone: user.phone,
        transactions: user.transactions,
        visa: user.visa,
      },
      token,
    });
  }),

  //MAKE SURE USER IS LOGGED IN
  Protect: asyncHandler(async (req, res, next) => {
    //1-check if token exist , if exist get it
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.json({ message: "please login first" });
    }
    /////////////////////////////////////////////////////////////////////

    //2-verify token (not change , expired..?)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    //console.log(decoded);
    //////////////////////////////////////////////////////////////////////////////////

    //3-check if user exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.json({
        message: "User who belongs to this token is no longer exist",
      });
    }
    ////////////////////////////////////////////////////////////////////////////////

    //4-check if user change password cause this will generate new token
    if (currentUser.passwordChangedAt) {
      const passwordChangedAtTotimeStamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000, //===> milleSecond to Second
        10
      );
      // console.log(passwordChangedAtTotimeStamp, decoded.iat); (decoded.iat)->time when token created
      //Password changed after token created (Error)
      if (passwordChangedAtTotimeStamp > decoded.iat) {
        return res.json({
          message: "user recently changed his password , please login again..",
        });
      }
    }

    req.user = currentUser;
    next();
  }),

  //['parent' , 'child]
  allowedTo: (...roles) =>
    asyncHandler(async (req, res, next) => {
      //access role
      //access registered user (req.user.role)
      if (!roles.includes(req.user.role)) {
        return res.json({
          message: "you are not allowed to access this route",
        });
      }
      next();
    }),

  forgetPassword: asyncHandler(async (req, res, next) => {
    //1-get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
        message: `there is no user with this email ${req.body.email}`,
      });
    }
    //2-if user exist , generate random 6 digits and save it in db and encrypt it to protect from hacking
    const ResetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedRestCode = crypto
      .createHash("sha256")
      .update(ResetCode)
      .digest("hex");

    //save hashed reset code into db
    user.passwordRestCode = hashedRestCode;
    //add expiration time to rest code (10 min)
    user.passwordRestExpires = Date.now() + 10 * 60 * 1000; //mille second to second
    user.passwordRestVerified = false;

    await user.save();
    //3-send the reset code via email
    const message = `Hi ${user.name} ,\n We received a request to reset the password on your Tab-Cash Account. \n${ResetCode} \n Enter this code to complete the reset \n thanks for helping us keep your account secure \n the Tab-cash team`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Your Password Rest Code (Valid For 10 Min) ",
        message,
      });
    } catch (error) {
      user.passwordRestCode = undefined;
      user.passwordRestExpires = undefined;
      user.passwordRestVerified = undefined;
      await user.save();
      return res.json({
        message: "there is an error in sending to email",
      });
    }

    res
      .status(200)
      .json({ status: "success", message: "reset code sent to email" });
  }),

  verifyResetCode: asyncHandler(async (req, res, next) => {
    //1) check reset code you enter is = reset code you send
    const hashedRestCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");
    //2)  get user by reset number
    const user = await User.findOne({ passwordRestCode: hashedRestCode });
    if (!user) {
      return res.json({ message: "Reset code invalid" });
    }
    //3) check reset code is  expired
    const checkExpired = await User.findOne({
      passwordRestExpires: { $gt: Date.now() },
    }); //لازم يكون وقت الانتهاء اكبر من الوقت اللي انا بدخله فيه
    if (!checkExpired) {
      return res.json({ message: "Reset code expired" });
    }
    //4)valid rest code
    user.passwordRestVerified = true;
    await user.save();

    res.status(200).json({ message: "verified successfully" });
  }),

  resetPassword: asyncHandler(async (req, res, next) => {
    //1) check user verified rest code
    //get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ message: "No user with this Email " });
    }
    //2)if verify is true
    if (!user.passwordRestVerified) {
      return res.json({
        message: "We send a Reset Code ,Please verify your email",
      });
    }

    //3) set new password
    user.password = req.body.newPassword;
    user.passwordRestCode = undefined;
    user.passwordRestExpires = undefined;
    user.passwordRestVerified = undefined;
    await user.save();
    //if every thing is ok generate new token
    const token = generateToken(user._id);

    res.status(200).json({ message: "new password set successfully", token });
  }),
};
