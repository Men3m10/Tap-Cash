const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const ApiErr = require("../utils/apiError");
const Visa = require("../models/visaModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const { generateCVV, generateExpiryDate } = require("../utils/visaUtils");
///////////////////////////////////////////////////////

module.exports = {
  //=======================================================================================
  createVisa: asyncHandler(async (req, res, next) => {
    // Get the amount from the request body
    const { amount, name } = req.body;

    if (!amount || !name) {
      return res.json({ message: "name or amount is invalid" });
    }
    // Generate a valid visa number using the generateVisaNumber function
    const generateVisaNumber = () => {
      // Initialize an empty string to store the number
      let number = "";
      // Initialize a sum variable
      let sum = 0;
      // Initialize an odd flag variable
      let odd = false;
      // Loop 16 times
      for (let i = 0; i < 16; i++) {
        // Generate a random digit from 0 to 9
        let digit = Math.floor(Math.random() * 10);
        // If it's the first iteration, append 4 to the number and the sum
        if (i === 0) {
          number += "4";
          sum += 4;
        } else {
          // Otherwise, append the digit to the number
          number += digit;
          // If the odd flag is true, double the digit
          if (odd) {
            digit *= 2;
            // If the digit is greater than 9, subtract 9 from it
            if (digit > 9) {
              digit -= 9;
            }
          }
          // Add the digit to the sum
          sum += digit;
        }
        // Toggle the odd flag
        odd = !odd;
      }
      // Check if the sum is divisible by 10
      if (sum % 10 === 0) {
        // If yes, return the number as a string
        return number;
      } else {
        // If no, recursively call the function until a valid number is generated
        return generateVisaNumber();
      }
    };

    const number = generateVisaNumber();

    // Generate a random expiry date using the generateExpiryDate function
    const expiryDate = generateExpiryDate();
    // Format the expiry date in MM/YY format for the response
    const formattedExpiryDate =
      expiryDate.slice(5, 7) + "/" + expiryDate.slice(2, 4);

    // Generate a random CVV code using the generateCVV function
    const cvv = generateCVV();

    //=============================================
    //hashing visa
    const hashedVisanum = crypto
      .createHash("sha256")
      .update(number)
      .digest("hex");
    //===================================
    const hashedVisacvv = crypto.createHash("sha256").update(cvv).digest("hex");
    //===================================

    //=============================================
    // Create a new visa credit card with the generated details and the owner set to the user id
    const visaCreditCard = new Visa({
      number: hashedVisanum,
      name,
      expiryDate,
      expiryDateString: formattedExpiryDate,
      cvv: hashedVisacvv,
      balance: amount,
      owner: req.user.id,
      //add expiration time to visa (5 min)
      visaExpired: Date.now() + 1 * 60 * 1000, //mille second to second
    });
    // Save the visa credit card to the database
    await visaCreditCard.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { visa: visaCreditCard._id },
    });
    const wallet = await Wallet.findOne({ owner: req.user.id });
    if (wallet.balance <= 0) {
      return res.json({ message: "your wallet is empty" });
    }

    wallet.balance -= amount;
    await wallet.save();
    // Send a success response with the visa credit card details
    res.status(200).json({
      message: "Visa credit card created successfully",
      number,
      name,
      cvv,
      balance: amount,
      expiryDateString: formattedExpiryDate,
      status: visaCreditCard.status,
    });
  }),
  checkExpiredVisa: asyncHandler(async (req, res, next) => {
    const { number } = req.body;
    //hashing visa
    const hashedVisanum = crypto
      .createHash("sha256")
      .update(number)
      .digest("hex");
    const visa = await Visa.findOne({ number: hashedVisanum });
    // check if the visa exists
    if (!visa) {
      return res.json({ message: "Visa not found" });
    }

    // check if the visa card is expired
    const checkExpired = await Visa.findOne({
      visaExpired: { $gt: Date.now() },
    }); //لازم يكون وقت الانتهاء اكبر من الوقت اللي انا بدخله فيه
    if (!checkExpired) {
      visa.status === "Expired";
      await visa.save();
      return res.json({ message: "Visa is expired" });
    }

    next();
  }),
  refundBalanceFromExpired: asyncHandler(async (req, res, next) => {
    //1)get Visa
    const { number } = req.body;
    //hashing visa
    const hashedVisanum = crypto
      .createHash("sha256")
      .update(number)
      .digest("hex");
    const visa = await Visa.findOne({ number: hashedVisanum });
    //2)check visa expired or not
    // check if the visa card is expired
    const checkExpired = await Visa.findOne({
      visaExpired: { $gt: Date.now() },
    });
    if (visa.balance == 0) {
      return res.json({ message: "we already returned your money" });
    }
    //3)if expired get the rest of the balance and add this balance to the user wallet
    if (!checkExpired) {
      const wallet = await Wallet.findOne({ owner: visa.owner });
      wallet.balance += visa.balance;
      await wallet.save();
    }
    res.status(200).json({ message: "the rest of visa balance is refunded " });
  }),
  payByVisa: asyncHandler(async (req, res, next) => {
    // Get the card details from the request body
    const { number, name, expiryDateString, cvv, cartMoney } = req.body;
    //=============================================
    //hashing visa
    const hashedVisanum = crypto
      .createHash("sha256")
      .update(number)
      .digest("hex");
    //===================================
    const hashedVisacvv = crypto.createHash("sha256").update(cvv).digest("hex");
    //===================================

    const visa = await Visa.findOne({ number: hashedVisanum });
    // check if the visa exists
    if (!visa) {
      return res.json({ message: "Visa not found" });
    }
    // check if user enter a valid visa
    if (
      hashedVisanum !== visa.number ||
      hashedVisacvv !== visa.cvv ||
      expiryDateString !== visa.expiryDateString ||
      name !== visa.name
    ) {
      return res.json({ message: "there is an error in one of your inputs" });
    }

    if (visa.balance !== 0) {
      visa.balance -= cartMoney;
      await visa.save();
    } else {
      return res.json({ message: "Visa balance is 0" });
    }
    //===================================
    res.status(200).json({ message: "Your Visa", data: visa });
  }),
  updateBalanceByVisa: asyncHandler(async (req, res, next) => {
    // Get the card details from the request body
    const { number, name, expiryDateString, cvv, phone, amount } = req.body;
    //hashing visa
    const hashedVisanum = crypto
      .createHash("sha256")
      .update(number)
      .digest("hex");
    //===================================
    const hashedVisacvv = crypto.createHash("sha256").update(cvv).digest("hex");
    //===================================

    const visa = await Visa.findOne({ number: hashedVisanum });
    // check if the visa exists
    if (!visa) {
      return res.json({ message: "Visa not found" });
    }
    // check if user enter a valid visa
    if (
      hashedVisanum !== visa.number ||
      hashedVisacvv !== visa.cvv ||
      expiryDateString !== visa.expiryDateString ||
      name !== visa.name
    ) {
      return res.json({ message: "there is an error in one of your inputs" });
    }
    const user = await User.findOne({ phone });

    if (!user) {
      return res.json({ message: "No user with this phone number" });
    }
    const wallet = await Wallet.findOne({ owner: user._id });
    if (visa.balance !== 0) {
      visa.balance -= amount;
      await visa.save();

      wallet.balance = parseInt(wallet.balance) + parseInt(amount);
      console.log(wallet.balance);
      await wallet.save();
    } else {
      return res.json({ message: "Visa balance is 0" });
    }
    //===================================
    res.status(200).json({ message: "Done" });
  }),
};
