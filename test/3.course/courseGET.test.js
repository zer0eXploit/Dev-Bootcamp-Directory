const app = require('../../app');

const request = require('supertest')(app);
const mongoose = require('mongoose');
const expect = require('chai').expect;

// Models
const Bootcamp = require('../../models/Bootcamp');
const Course = require('../../models/Course');

const bootcamp = {
  _id: '5d713995b721c3bb38c1f5d0',
  user: '5d7a514b5d2c12c7449be045',
  name: 'Devworks Bootcamp',
  description: 'Awesome Description',
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

const course = {
  _id: '5d725a4a7b292f5f8ceff789',
  title: 'Front End Web Development',
  description: 'Nice course.',
  weeks: 8,
  tuition: 8000,
  minimumSkill: 'beginner',
  scholarshipsAvailable: true,
  bootcamp: '5d713995b721c3bb38c1f5d0',
  user: '607c2e7951e97dcba431a3b8',
};

const endPoint = `/api/v1/courses/${course._id}`;

before(function (done) {
  // DB connection takes time
  this.timeout(0);

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

describe('Individual Course Route Tests. [GET]', function () {
  this.timeout(0);

  before(async function () {
    await Bootcamp.create(bootcamp);
    await Course.create(course);
  });

  after(async function () {
    await Bootcamp.deleteMany();
  });

  it('Respond to a request.', async function () {
    await request.get(`${endPoint}/${bootcamp._id}`);
  });

  it('Respond with a 404 if there is no specified course.', async function () {
    const idNotInDB = '8d713995b721c3bb38c1f5d0';
    const endPoint = `/api/v1/courses/${idNotInDB}`;

    const statusCode = await (await request.get(`${endPoint}`)).status;
    expect(statusCode).to.equal(404);
  });

  it('Respond with a 404 if invalid course ID is supplied.', async function () {
    const endPoint = `/api/v1/courses/invalidID`;

    const statusCode = await (await request.get(`${endPoint}`)).status;
    expect(statusCode).to.equal(404);
  });

  it('Respond with a status of 200 if a course is found.', async function () {
    await request.get(`${endPoint}`).expect(200);
  });

  it('Contain one course info in respond body.', async function () {
    const response = await request.get(`${endPoint}`);
    expect(response.body.data).to.be.not.undefined;
  });
});
