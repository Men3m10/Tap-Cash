const asyncHandler = require("express-async-handler");
const Request = require("../models/requestModel");
const User = require("../models/userModel");
module.exports = {
  createRequest: asyncHandler(async (req, res, next) => {
    const { amount, requester, approver, reason } = req.body;
    // check if the requester and approver are valid users
    const requesterUser = await User.findById(requester);
    const approverUser = await User.findById(approver);
    if (!requesterUser || !approverUser) {
      return res.status(404).json({ message: "Invalid users" });
    }

    // check if the requester and approver have different roles
    if (requesterUser.role === approverUser.role) {
      return res
        .status(400)
        .json({ message: "Requester and approver must have different roles" });
    }
    // create a new request instance with the data
    const newRequest = new Request({
      amount,
      requester,
      approver,
      reason,
    });

    // save the request to the database
    await newRequest.save();
    // send back the request data as a response
    res.status(201).json(newRequest);
  }),
  getRequests: asyncHandler(async (req, res, next) => {
    // find all requests in the database and populate their requester and approver fields
    const requests = await Request.find()
      .populate("requester")
      .populate("approver");
    // send back the requests data as a response
    res.status(200).json(requests);
  }),
  getRequestById: asyncHandler(async (req, res, next) => {
    // get the request id from the request params
    const { id } = req.params;
    // find the request by id in the database and populate their requester and approver fields
    const request = await Request.findById(id)
      .populate("requester")
      .populate("approver");
    // check if the request exists
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    // send back the request data as a response
    res.status(200).json(request);
  }),
  updateRequestById: asyncHandler(async (req, res, next) => {
    // get the request id from the request params
    const { id } = req.params;

    // get the update data from the request body
    const updateData = req.body;
    // find and update the request by id in the database
    const updatedRequest = await Request.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    // check if the request exists
    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    // send back the updated request data as a response
    res.status(200).json(updatedRequest);
  }),

  deleteRequestById: asyncHandler(async (req, res, next) => {
    // get the request id from the request params
    const { id } = req.params;

    // find and delete the request by id in the database
    const deletedRequest = await Request.findByIdAndDelete(id);

    // check if the request exists
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // send back a success message as a response
    res.status(200).json({ message: "Request deleted successfully" });
  }),
};
