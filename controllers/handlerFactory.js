const asyncHandler = require("express-async-handler");

const ApiErr = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model, name) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiErr(`no ${name} with this id`, 404));
    }
    // trigger "remove "event when update document
    document.remove();
    res.status(200).json({ message: ` ${name} deleted successfully` });
  });

exports.getOnebyId = (Model, name, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    //1)build query
    let query = Model.findById(id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    //2)excute query
    const document = await query;
    if (!document) {
      return next(new ApiErr(`no ${name} with this id`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.updateOnebyId = (Model, name) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new ApiErr(`no ${name} with this id`, 404));
    }
    // trigger "save "event when update document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({ data: document });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query);
    const count = await Model.countDocuments();
    apiFeatures.filter().sort().fieldChosen().paginate(count).search(modelName);

    const { mongooseQuery, paginationResult } = apiFeatures;
    const document = await mongooseQuery;

    res
      .status(200)
      .json({ result: document.length, paginationResult, data: document });
  });
