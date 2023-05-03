const mongoose = require("mongoose");

//CONNECT TO DB
const DBconnection = () => {
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`DataBase connected ${conn.connection.host}`);
  });
  // .catch((err) => {
  //   console.error(`DataBase Error ${err}`);
  //   process.exit(1);
  // });
};

module.exports = DBconnection;
