const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionsModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const ApiErr = require("../utils/apiError");

module.exports = {
  createTransaction: asyncHandler(async (req, res, next) => {
    // get the transaction data from the request body
    const { amount, sender, receiver, description } = req.body;

    // check if the sender and receiver are valid users
    const senderUser = await User.findOne({ phone: sender });
    const receiverUser = await User.findOne({ phone: receiver });
    if (!senderUser || !receiverUser) {
      return res.json({ message: "Invalid users" });
    }

    // Check if both users have different roles and are related as parent and child or vice versa
    if (
      (senderUser.role === receiverUser.role &&
        senderUser.role === "child" &&
        receiverUser.role === "child") ||
      (senderUser.role === "child" && senderUser.parent !== receiverUser._id)
    ) {
      return res.json({ message: "Cannot send money to this user" });
    }

    // check if the sender has enough balance in their wallet
    const senderWallet = await Wallet.findById(senderUser.wallet);
    if (senderWallet.balance < amount) {
      return res.json({ message: "Insufficient funds" });
    }

    // create a new transaction instance with the data
    const newTransaction = new Transaction({
      amount,
      sender,
      receiver,
      description,
    });
    // save the transaction to the database
    await newTransaction.save();

    // Add the new transaction to both users' transactions array
    await User.findByIdAndUpdate(senderUser._id, {
      $push: { transactions: newTransaction._id },
    });
    await User.findByIdAndUpdate(receiverUser._id, {
      $push: { transactions: newTransaction._id },
    });
    // send back th transaction data as a response
    res.status(201).json(newTransaction);
  }),

  approvingTransaction: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    // Validate the input
    if (!id || !status) {
      return res.json({ message: "Missing required parameters" });
    }
    if (!["approved", "declined"].includes(status)) {
      return res.json({ message: "Invalid status value" });
    }
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.json({ message: "Transaction not found" });
    }
    if (transaction.status !== "pending") {
      return res.json({ message: "Transaction already processed" });
    }
    transaction.status = status;
    await transaction.save();
    if (status === "approved") {
      // Find the sender and receiver wallets
      const senderWallet = await Wallet.findOne({ owner: transaction.sender });
      const receiverWallet = await Wallet.findOne({
        owner: transaction.receiver,
      });

      if (!senderWallet || !receiverWallet) {
        return res.json({ message: "Wallet not found" });
      }

      if (senderWallet.balance < transaction.amount) {
        return res.json({ message: "Insufficient balance" });
      }
      // Update the sender and receiver wallets balance
      senderWallet.balance -= transaction.amount;
      receiverWallet.balance += transaction.amount;
      await senderWallet.save();
      await receiverWallet.save();
    }
    if (status === "declined") {
      return res.status(200).json({ message: "transaction decliend !" });
    }
    // Send a success response with the updated transaction
    res.status(200).json({ message: "Transaction updated", transaction });
  }),
  getTransactions: asyncHandler(async (req, res, next) => {
    // find all transactions in th database and populate their sender and receiver fields
    const transactions = await Transaction.find()
      .populate("sender")
      .populate("receiver");
    if (!transactions) {
      return res.json({ message: "No transactions found" });
    }
    // send back th transactions data as a response
    res.status(200).json(transactions);
  }),
  getLoggedUserTransactions: asyncHandler(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
  }),
  getUserTransaction: asyncHandler(async (req, res, next) => {
    // get the user id from the request params
    const { id } = req.params;

    // find the user by id in the database and populate their wallet and children fields
    const user = await User.findById(id)
      .populate("transactions")
      .select("transactions")
      .populate("sender");
    // check if the user exists
    if (!user) {
      return res.json({ message: "User not found" });
    }
    // send back the user data as a response
    res.status(200).json(user);
  }),
  getTransactionById: asyncHandler(async (req, res, next) => {
    // get th transaction id from th request params
    const { id } = req.params;

    // find th transaction by id in th database and populate their sender and receiver fields
    const transaction = await Transaction.findById(id)
      .populate("sender")
      .populate("receiver");
    // check if th transaction exists
    if (!transaction) {
      return res.json({ message: "Transaction not found" });
    }

    // send back th transaction data as a response
    res.status(200).json(transaction);
  }),

  updateTransactionById: asyncHandler(async (req, res, next) => {
    // get th transaction id from th request params
    const { id } = req.params;

    // find and update th transaction by id in th database
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedTransaction) {
      return res.json({ message: "Transaction not found" });
    }

    // send back th updated transaction data as a response
    res.status(200).json({ data: updatedTransaction });
  }),

  deleteTransactionById: asyncHandler(async (req, res, next) => {
    // get th transaction id from th request params
    const { id } = req.params;
    // find and delete th transaction by id in th database
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    // check if th transaction exists
    if (!deletedTransaction) {
      return res.json({ message: "Transaction not found" });
    }

    // send back a success message as a response
    res.status(200).json({ message: "Transaction deleted successfully" });
  }),
};
