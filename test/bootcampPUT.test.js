const app = require('../app');

const request = require('supertest')(app);
const mongoose = require('mongoose');
const expect = require('chai').expect;

// Models
const Bootcamp = require('../models/Bootcamp');

const endPoint = '/api/v1/bootcamps';

const bootcamp = {
  _id: '5d713995b721c3bb38c1f5d0',
  user: '607c2e7951e97dcba431a3b8', //actual user in db's id.
  name: 'Devworks Bootcamp',
  description: 'Some catchy description.',
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
      const newBootcamp = { ...bootcamp };
      newBootcamp.name = 'Test I';
      newBootcamp._id = '5d713995b721c3bb38c1f5aa';
      newBootcamp.user = '607c2e7951e97dcba431a3b9';
      Bootcamp.create(newBootcamp).then(() => done());
    });
});

after(function () {
  // Close DB connection
  mongoose.disconnect();
});

describe('Individual Bootcamp Route Tests. [PUT]', function () {
  this.timeout(10000);

  before(async function () {
    await Bootcamp.create(bootcamp);
  });

  after(async function () {
    await Bootcamp.deleteMany();
  });

  it('Respond to a request.', async function () {
    await request.put(`${endPoint}/${bootcamp._id}`);
  });

  it('Respond with 401 if Authorization header is not present.', async function () {
    const statusCode = await (await request.put(`${endPoint}/${bootcamp._id}`))
      .status;
    expect(statusCode).to.equal(401);
  });

  it('Respond with 401 if Authorization token is invalid.', async function () {
    await request
      .put(`${endPoint}/${bootcamp._id}`)
      .set('Authorization', 'Bearer InvalidToken')
      .expect(401);
  });

  it('A user shall not update a bootcamp.', async function () {
    await request
      .put(`${endPoint}/${bootcamp._id}`)
      .set('Authorization', `Bearer ${process.env.USER_TOKEN}`)
      .expect(403);
  });

  it('Respond with a 404 if there is no specified bootcamp.', async function () {
    const idNotInDB = '8d713995b721c3bb38c1f5d0';

    await request
      .put(`${endPoint}/${idNotInDB}`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(404);
  });

  it('Respond with a 404 if invalid bootcamp ID is supplied.', async function () {
    await request
      .put(`${endPoint}/invalidID`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(404);
  });

  it('Publisher shall be able to update their bootcamp.', async function () {
    await request
      .put(`${endPoint}/${bootcamp._id}`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(200);
  });

  it('Publisher can only update their own bootcamp.', async function () {
    const alreadyCreated = '5d713995b721c3bb38c1f5aa';
    await request
      .put(`${endPoint}/${alreadyCreated}`)
      .set('Authorization', `Bearer ${process.env.PUBLISHER_TOKEN}`)
      .expect(403);
  });

  it('Admin can update any bootcamp.', async function () {
    const alreadyCreated = '5d713995b721c3bb38c1f5aa';
    await request
      .put(`${endPoint}/${alreadyCreated}`)
      .set('Authorization', `Bearer ${process.env.ADMIN_TOKEN}`)
      .expect(200);
  });
});
