const ApiErr = require("../utils/apiError");

const sendErrorforDEV = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
const sendErrorforPRO = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const handleJwtInvalidSignature = () =>
  new ApiErr("invalid token , please login again ..", 401);

const handleJwtexpiredToken = () =>
  new ApiErr("expired token , please login again ..", 401);

const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // eslint-disable-next-line eqeqeq
  if (process.env.NODE_ENV == "development") {
    // eslint-disable-next-line no-use-before-define
    sendErrorforDEV(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtexpiredToken();

    sendErrorforPRO(err, res);
  }
};

module.exports = ErrorMiddleware;
