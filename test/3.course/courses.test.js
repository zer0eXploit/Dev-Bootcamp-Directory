const app = require('../../app');

const request = require('supertest')(app);
const mongoose = require('mongoose');
const expect = require('chai').expect;

// Models
const Bootcamp = require('../../models/Bootcamp');
const Course = require('../../models/Course');

// Dummy data for test
const bootcamp = {
  _id: '5d713995b721c3bb38c1f5d0',
  user: '607c2e7951e97dcba431a3b8', // actual user inside the db.
  name: 'Devworks Bootcamp',
  description: 'A great catchy description',
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

const allCoursesUri = '/api/v1/courses';
const coursesInABootcampUri = `/api/v1/bootcamps/${bootcamp._id}/courses`;

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

describe('Courses from all bootcamps [GET].', function () {
  this.timeout(0);

  before(async function () {
    // Create a bootcamp
    await Bootcamp.create(bootcamp);
    await Course.create(course);
  });

  after(async function () {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
  });

  it('Respond the request.', async function () {
    await request.get(allCoursesUri);
  });

  it('Return all courses, at least one course.', async function () {
    const response = await request.get(allCoursesUri);
    expect(response.status).to.be.equal(200);
    expect(response.body.length).to.be.greaterThanOrEqual(1);
  });
  // paginationInfo

  it('Contains pagination information.', async function () {
    const response = await request.get(allCoursesUri);
    expect(response.body.paginationInfo).to.not.be.undefined;
  });
});

describe('Courses from a bootcamp. [GET]', function () {
  this.timeout(0);

  before(async function () {
    // Create a bootcamp
    await Bootcamp.create(bootcamp);
    await Course.create(course);
  });

  after(async function () {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
  });

  it('Respond the request.', async function () {
    await request.get(coursesInABootcampUri);
  });

  it('Return all courses, at least one course.', async function () {
    const response = await request.get(coursesInABootcampUri);
    expect(response.status).to.be.equal(200);
    expect(response.body.count).to.be.greaterThanOrEqual(1);
  });

  it('Respond with 404 if bootcamp id is invalid.', async function () {
    const response = await request.get(
      '/api/v1/bootcamps/invalid_campID/courses',
    );
    expect(response.status).to.be.equal(404);
  });

  it('Respond with status 200 even if no courses in a bootcamp.', async function () {
    const response = await request.get(
      '/api/v1/bootcamps/5d713995b721c3bb38c1f5d1/courses',
    );
    expect(response.status).to.be.equal(200);
  });
});

describe('Creating a course under a bootcamp. [POST]', function () {
  this.timeout(0);

  before(async function () {
    await Bootcamp.create(bootcamp);
  });

  after(async function () {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
  });

  it('Respond with 401 status if Authorization header is not present.', async function () {
    const statusCode = await (await request.post(coursesInABootcampUri)).status;
    expect(statusCode).to.equal(401);
  });

  it('Respond with 401 status if Authorization token is invalid.', async function () {
    await request
      .post(coursesInABootcampUri)
      .set('Authorization', 'Bearer InvalidToken')
      .expect(401);
  });

  it('A user shall not create a course.', async function () {
    await request
      .post(coursesInABootcampUri)
      .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
      .expect(403);
  });

  it('A publisher shall be able to create a course.', async function () {
    await request
      .post(coursesInABootcampUri)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .send(course)
      .expect(201);
  });

  it('A publisher shall be able to create more than one course.', async function () {
    const newCourse = { ...course };
    newCourse._id = undefined;
    await request
      .post(coursesInABootcampUri)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .send(newCourse)
      .expect(201);
  });

  it('An admin shall be able to create a course.', async function () {
    const newCourse = { ...course };
    newCourse._id = undefined;
    await request
      .post(coursesInABootcampUri)
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send(newCourse)
      .expect(201);
  });
});
