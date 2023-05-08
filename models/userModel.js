const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "email already exists "],
    },
    ssid: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: [14, "national id must be 14 number "],
      maxlength: [14, "national id must be 14 number "],
    },
    phone: {
      type: String,
      required: true,
    },
    userImg: String,
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "too short password"],
    },
    passwordChangedAt: Date,
    passwordRestCode: String,
    passwordRestExpires: Date,
    passwordRestVerified: Boolean,
    role: {
      type: String,
      enum: ["parent", "child"],
      required: true,
      default: "parent",
    },
    wallet: {
      type: mongoose.Schema.ObjectId,
      ref: "Wallet",
    },
    parent: { type: mongoose.Schema.ObjectId, ref: "User" },
    children: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    transactions: [{ type: mongoose.Schema.ObjectId, ref: "Transaction" }],
    visa: [{ type: mongoose.Schema.ObjectId, ref: "Visa" }],
  },
  { timestamps: true, strictPopulate: false }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
//This collection stores the information of the users, such as their name, email, password, role (parent or child), and wallet ID
