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

describe('Bootcamps Routes Tests. [GET]', function () {
  this.timeout(10000);

  before(async function () {
    await Bootcamp.create(bootcamp);
  });

  after(async function () {
    await Bootcamp.deleteMany();
  });

  it('Should respond to a request.', async function () {
    await request.get(endPoint);
  });

  it('Should not respond with a 404 status.', async function () {
    const statusCode = await (await request.get(endPoint)).status;
    expect(statusCode).to.not.equal(404);
  });

  it('Should respond with a status of 200.', async function () {
    await request.get(endPoint).expect(200);
  });

  it('Should contain a pagination object.', async function () {
    const response = await request.get(endPoint);
    expect(response.body).to.have.own.property('paginationInfo');
  });

  it('Should contain at least one bootcamp info in respond body.', async function () {
    const response = await request.get(endPoint);
    expect(response.body.data.length).to.be.greaterThanOrEqual(1);
  });
});

describe('Bootcamps Routes Tests. [POST]', function () {
  this.timeout(20000);

  after(async function () {
    await Bootcamp.deleteMany();
  });

  it('Respond with 401 status if Authorization header is not present.', async function () {
    const statusCode = await (await request.post(endPoint)).status;
    expect(statusCode).to.equal(401);
  });

  it('Respond with 401 status if Authorization token is invalid.', async function () {
    await request
      .post(endPoint)
      .set('Authorization', 'Bearer InvalidToken')
      .expect(401);
  });

  it('A user shall not create a bootcamp.', async function () {
    await request
      .post(endPoint)
      .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
      .expect(403);
  });

  it('A publisher shall be able to create a bootcamp.', async function () {
    await request
      .post(endPoint)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .send(bootcamp)
      .expect(201);
  });

  it('A publisher shall not be able to create more than one bootcamp.', async function () {
    await request
      .post(endPoint)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .send(bootcamp)
      .expect(403);
  });

  it('Bootcamps must have unique names.', async function () {
    await request
      .post(endPoint)
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send(bootcamp)
      .expect(400);
  });

  it('An admin shall be able to create a bootcamp.', async function () {
    //   Get a copy of bootcamp
    const adminBootcamp = { ...bootcamp };
    // Change the name and ID
    adminBootcamp._id = undefined;
    adminBootcamp.name = 'Created By Admin';
    await request
      .post(endPoint)
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send(adminBootcamp)
      .expect(201);
  });

  it('An admin shall be able to create more than one bootcamp.', async function () {
    //   Get a copy of bootcamp
    const adminBootcamp = { ...bootcamp };
    // Change the name and ID
    adminBootcamp._id = undefined;
    adminBootcamp.name = 'Created By Admin II';
    await request
      .post(endPoint)
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .send(adminBootcamp)
      .expect(201);
  });
});
