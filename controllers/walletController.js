const asyncHandler = require("express-async-handler");
const Wallet = require("../models/walletModel");
module.exports = {
  getWallets: asyncHandler(async (req, res, next) => {
    // find all wallets in th database and populate their owner and children fields
    const wallets = await Wallet.find().populate("owner");

    // send back th wallets data as a response
    res.status(200).json(wallets);
  }),
  getWalletById: asyncHandler(async (req, res, next) => {
    // get th wallet id from th request params
    const { id } = req.params;
    // find th wallet by id in th database and populate their owner and children fields
    const wallet = await Wallet.findById(id).populate("owner");

    // check if the wallet exists
    if (!wallet) {
      return res.json({ message: "Wallet not found" });
    }
    // send back the wallet data as a response
    res.status(200).json(wallet);
  }),
  updateWalletById: asyncHandler(async (req, res, next) => {
    // get the wallet id from the request params
    const { id } = req.params;

    // get the update data from the request body
    const updateData = req.body;

    // find and update the wallet by id in the database
    const updatedWallet = await Wallet.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // check if the wallet exists
    if (!updatedWallet) {
      return res.json({ message: "Wallet not found" });
    }

    // send back the updated wallet data as a response
    res.status(200).json(updatedWallet);
  }),
  deleteWalletById: asyncHandler(async (req, res, next) => {
    // get the wallet id from the request params
    const { id } = req.params;
    // find and delete the wallet by id in the database
    const deletedWallet = await Wallet.findByIdAndDelete(id);

    // check if the wallet exists
    if (!deletedWallet) {
      return res.json({ message: "Wallet not found" });
    }

    // send back a success message as a response
    res.status(200).json({ message: "Wallet deleted successfully" });
  }),
};
