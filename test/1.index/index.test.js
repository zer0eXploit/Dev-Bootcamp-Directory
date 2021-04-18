const app = require('../../app');

const expect = require('chai').expect;
const request = require('supertest')(app);

describe('Index Route Tests', function () {
  it('Should respond to a request.', async function () {
    await request.get('/');
  });

  it('Should not respond with a 404 status.', async function () {
    const statusCode = await (await request.get('/')).status;
    expect(statusCode).to.not.equal(404);
  });

  it('Should respond with a status of 200.', async function () {
    await request.get('/').expect(200);
  });

  it('Should respond with exact json value.', async function () {
    const responseObject = {
      API_DOCS: 'https://documenter.getpostman.com/view/8103362/TzJrCeZN',
    };
    const response = await request.get('/');
    expect(response.body).to.be.deep.equal(responseObject);
  });
});
