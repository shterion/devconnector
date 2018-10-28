process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const request = require('supertest');

const log = require('./../routes/api/utils/logger');
const app = require('./../server.js');
const { users, populateUsers } = require('./seed/users.seed');

chai.use(chaiHttp);

beforeEach(populateUsers);

describe('/users/register - User registration', () => {
  const user = {
    name: 'Jack Lee',
    email: 'lee@yahoo.com',
    password: 'qwerty',
    confirmPassword: 'qwerty',
  };
  it('should return 200 and the new created user', (done) => {
    request(app)
      .post('/api/users/register')
      .send(user)
      .then((res) => {
        expect(res.body).to.have.own.property('_id');
        expect(res.body.name).to.equal(user.name);
        expect(res).to.have.status(200);
      })
      .catch((err) => {
        log.error(err);
        throw err;
      })
      .then(done());
  });

  it('should return 400 and if use already exists', (done) => {
    request(app)
      .post('/api/users/register')
      .send(users[0])
      .then((res) => {
        expect(res).to.have.status(400);
      })
      .catch((err) => {
        log.error(err);
        throw err;
      })
      .then(done());
  });
});

describe('/api/users/login - User login', () => {
  it('should return 200 and the logged in user', (done) => {
    request(app)
      .post('/api/users/login')
      .send({
        email: users[0].email,
        password: users[0].password,
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
      })
      .catch((err) => {
        log.error(err);
        throw err;
      })
      .then(done());
  });

  it('should return 404 if no user found', (done) => {
    request(app)
      .post('/api/users/login')
      .send({
        email: 'foo@gmail.com',
        password: users[0].password,
      })
      .then((res) => {
        expect(res).to.have.status(404);
      })
      .catch((err) => {
        log.error(err);
        throw err;
      })
      .then(done());
  });

  it('should return 400 if password incorrect', (done) => {
    request(app)
      .post('/api/users/login')
      .send({
        email: users[0].email,
        password: 'qweop',
      })
      .then((res) => {
        // expect(res.text).to.equal('No user with this email found!');
        expect(res).to.have.status(400);
      })
      .catch((err) => {
        log.error(err);
        throw err;
      })
      .then(done());
  });
});
