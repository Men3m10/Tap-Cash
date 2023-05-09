// Require mongoose module
const mongoose = require("mongoose");

// Define a schema for the visa model
const VisaSchema = new mongoose.Schema({
  // Visa number
  number: {
    type: String,
    required: true,
    unique: true,
  },
  // Visa holder name
  name: {
    type: String,
    required: true,
  },
  // Visa expiry date
  expiryDate: {
    type: Date,
    required: true,
  },
  expiryDateString: {
    type: String,
    required: true,
  },
  // Visa CVV code
  cvv: {
    type: String,
    required: true,
  },
  visaExpired: Date,
  // Visa balance
  balance: {
    type: Number,
    default: 0,
  },
  // Visa owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Export the visa model
module.exports = mongoose.model("Visa", VisaSchema);
