const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionsModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
module.exports = {
  createTransaction: asyncHandler(async (req, res, next) => {
    // get the transaction data from the request body
    const { amount, sender, receiver, description } = req.body;

    // check if the sender and receiver are valid users
    const senderUser = await User.findById(sender);
    const receiverUser = await User.findById(receiver);
    if (!senderUser || !receiverUser) {
      return res.status(404).json({ message: "Invalid users" });
    }

    // Check if both users have different roles and are related as parent and child or vice versa
    if (
      (senderUser.role === receiverUser.role &&
        senderUser.role === "child" &&
        receiverUser.role === "child") ||
      (senderUser.role === "child" && senderUser.parent !== receiverUser._id)
    ) {
      return res
        .status(403)
        .json({ message: "Cannot send money to this user" });
    }

    // check if the sender has enough balance in their wallet
    const senderWallet = await Wallet.findById(senderUser.wallet);
    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
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

    // update th sender and receiver wallets with th transaction amount
    senderWallet.balance -= amount;
    await senderWallet.save();

    const receiverWallet = await Wallet.findById(receiverUser.wallet);
    receiverWallet.balance += amount;
    await receiverWallet.save();
    // send back th transaction data as a response
    res.status(201).json(newTransaction);
  }),

  getTransactions: asyncHandler(async (req, res, next) => {
    // find all transactions in th database and populate their sender and receiver fields
    const transactions = await Transaction.find()
      .populate("sender")
      .populate("receiver");

    // send back th transactions data as a response
    res.status(200).json(transactions);
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
      return res.status(404).json({ message: "Transaction not found" });
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
      return next(new ApiErr(`Transaction not found`, 404));
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
      return res.status(404).json({ message: "Transaction not found" });
    }

    // send back a success message as a response
    res.status(200).json({ message: "Transaction deleted successfully" });
  }),
  transactionStatus: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      returnres.status(400).json({ message: "Missing required fields" });
    }
    if (status !== "approved" && status !== "declined") {
      returnres.status(400).json({ message: "Invalid action" });
    }

    // Find the transaction by its id in the database
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      returnres.status(404).json({ message: "Transaction not found" });
    }
    // Check if the transaction is still pending
    if (transaction.status !== "pending") {
      return res.status(409).json({ message: "Transaction already processed" });
    }
    // Update transaction status according to action
    await Transaction.findByIdAndUpdate(id, { status }, { new: true });
  }),
};
