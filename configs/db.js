const mongoose = require('mongoose');

// @desc    Connects to mongodb and logs hostname
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.underline.bold);
};

module.exports = connectDB;
