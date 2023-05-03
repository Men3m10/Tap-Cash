const path = require("path");

const compression = require("compression");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

const ApiErr = require("./utils/apiError");
const ErrorMiddleware = require("./middlewares/errMiddleware");
const DBconnection = require("./config/database");

dotenv.config({ path: "config.env" });

//////////////    Connect with DB  ///////////////////
DBconnection();
////////////////////////////////////
// express
const app = express();

//enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all response
app.use(compression());

app.use(express.json());
app.use(express.static(path.join(__dirname, "/uploads")));

////////////////////Models////////////////
const Routes = require("./routers");
//////////////////////////////////////////
////////////////////Routes////////////////
Routes(app);

app.all("*", (req, res, next) => {
  //هيشوف كل الراوتس اللي فوق لو ملقاش اللي انا دخلته هيخش علي دي
  //احنا عاملين الايرور دا علشان لو دخلنا راوت مش موجود اصلا يرجع يقولي انه م موجود
  // const err = new Error(`Can not find this route ${req.originalUrl}`);
  next(new ApiErr(`Can not find this route ${req.originalUrl}`, 400));
});
/////////////////////////////////////////////
//error handling middleware for express
app.use(ErrorMiddleware);
//////////////////////////////////////////

//middleWares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Your port is running : ${PORT}`);
});

// اي ايرور هيحصل خارج اكسبريس مش معمول ليه هندله دا هيلقطه و يجيبه
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors ${err.name} |${err.message}`);
  server.close(() => {
    console.error(` server => shutting down ...`);
    process.exit(1);
  });
});
