const fs = require('fs');

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const colors = require('colors');

// Load ENV
dotenv.config({ path: './configs/config.env' });

// Import Models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((conn) =>
    console.log(`Connected to ${conn.connection.host}`.blue.inverse),
  )
  .catch((e) =>
    console.log(`Error establishing db connection. ${e}`.black.bgWhite),
  );

//   Read local json files
const JSONPath = `${__dirname}/data`;

const bootcamps = JSON.parse(fs.readFileSync(`${JSONPath}/bootcamps.json`));
const courses = JSON.parse(fs.readFileSync(`${JSONPath}/courses.json`));
const users = JSON.parse(fs.readFileSync(`${JSONPath}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${JSONPath}/reviews.json`));

// Seed into database
const seedToDB = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log(`Data seeded.`.green.inverse);
    process.exit();
  } catch (e) {
    console.log(`${e}`.red.inverse);
    process.exit();
  }
};

const destroyDB = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log(`All data deleted.`.green.inverse);
    process.exit();
  } catch (e) {
    console.log(`${e}`.red.inverse);
    process.exit();
  }
};

if (process.argv[2] === '-i') {
  seedToDB();
} else if (process.argv[2] === '-d') {
  destroyDB();
}
