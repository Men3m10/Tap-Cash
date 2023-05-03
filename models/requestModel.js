const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    requester: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    approver: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
//his collection stores the information of the requests, such as their amount, date, status, requester, approver, and reason.
