const mongoose = require("mongoose");

module.exports = async function connect(uri) {
  mongoose.set("strictQuery", true);
  return mongoose.connect(uri, {
    dbName: "carGarageDB",
    autoIndex: true,
    maxPoolSize: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
