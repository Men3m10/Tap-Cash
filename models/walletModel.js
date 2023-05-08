const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletSchema = new Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "EGP",
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
// This collection stores the information of the wallets, such as their balance, currency, owner, and children.
