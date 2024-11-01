const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(
    "mongodb+srv://vipul1:vipul123@authapp.hz2n5r9.mongodb.net/devTinder"
  );
};

module.exports = { connectDB };
