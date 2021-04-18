const app = require('../app');

const request = require('supertest')(app);
const mongoose = require('mongoose');
const expect = require('chai').expect;

// Models
const Bootcamp = require('../models/Bootcamp');

const endPoint = '/api/v1/bootcamps';

const bootcamp = {
  _id: '5d713995b721c3bb38c1f5d0',
  user: '5d7a514b5d2c12c7449be045',
  name: 'Devworks Bootcamp',
  description:
    'Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer',
  website: 'https://devworks.com',
  phone: '(111) 111-1111',
  email: 'enroll@devworks.com',
  address: '233 Bay State Rd Boston MA 02215',
  careers: ['Web Development', 'UI/UX', 'Business'],
  housing: true,
  jobAssistance: true,
  jobGuarantee: false,
  acceptGi: true,
};

before(function (done) {
  // Increase the timeout because DB connection takes time
  this.timeout(10000);

  // Connect to DB
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => {
      done();
    });
});

after(function () {
  // Close DB connection
  mongoose.disconnect();
});
