const app = require('../../app');

const request = require('supertest')(app);
const mongoose = require('mongoose');
const expect = require('chai').expect;

// Models
const Course = require('../../models/Course');
const Bootcamp = require('../../models/Bootcamp');

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

describe('Individual Bootcamp Route Tests. [DELETE]', function () {
  this.timeout(0);

  before(async function () {
    const anotherCourse = { ...course };
    anotherCourse._id = '5d725a4a7b292f5f8ceff788';
    anotherCourse.user = '607c2e7951e97dcba431a3b9';

    await Bootcamp.create(bootcamp);
    await Course.create(course);
    await Course.create(anotherCourse);
  });

  after(async function () {
    await Bootcamp.deleteMany();
  });

  it('Respond to a request.', async function () {
    await request.delete(`${endPoint}`);
  });

  it('Respond with 401 if Authorization header is not present.', async function () {
    const statusCode = await (await request.delete(`${endPoint}`)).status;
    expect(statusCode).to.equal(401);
  });

  it('Respond with 401 if Authorization token is invalid.', async function () {
    await request
      .delete(`${endPoint}`)
      .set('Authorization', 'Bearer InvalidToken')
      .expect(401);
  });

  it('A user shall not delete a course.', async function () {
    await request
      .delete(`${endPoint}`)
      .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
      .expect(403);
  });

  it('Respond with a 404 if there is no specified course.', async function () {
    const idNotInDB = '8d713995b721c3bb38c1f5d0';
    const endPoint = '/api/v1/courses';
    await request
      .delete(`${endPoint}/${idNotInDB}`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(404);
  });

  it('Respond with a 404 if invalid course ID is supplied.', async function () {
    const endPoint = '/api/v1/courses';
    await request
      .delete(`${endPoint}/invalidID`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(404);
  });

  it('Publisher shall be able to delete their course.', async function () {
    await request
      .delete(`${endPoint}`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(200);
  });

  it('Publisher can only delete their own course.', async function () {
    const alreadyCreated = '5d725a4a7b292f5f8ceff788';
    const endPoint = '/api/v1/courses';
    await request
      .delete(`${endPoint}/${alreadyCreated}`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(403);
  });

  it('Admin can delete any course.', async function () {
    const alreadyCreated = '5d725a4a7b292f5f8ceff788';
    const endPoint = '/api/v1/courses';
    await request
      .delete(`${endPoint}/${alreadyCreated}`)
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .expect(200);
  });
});
