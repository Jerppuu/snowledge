var userapi = require('../routers/objectRouters/users');
var chai = require('chai');
var chaiPromises = require('chai-as-promised');
chai.use(chaiPromises);
var assert = chai.assert;
var expect = chai.expect;

describe('GET users', function () {
  it('should get all users', async function () {
    userapi.getAll()
      .then((users) => {
        assert.deepEqual(users, [
          { firstname: "first", lastname: "user", email: "first@user.com", id: 1 },
          { firstname: "second", lastname: "user", email: "second@user.com", id: 2 }
        ]);
        done();
      });
  });
});

describe('GET single user', function () {
  it('should get specific user with valid id', async function () {
    let req = { decoded: { id: 1 }};
    userapi.getUser(req)
      .then((user) => {
        assert.deepEqual(user, [{ firstname: "first", lastname: "user", email: "first@user.com", id: 1 }]);
        done();
      });
  });
  it('should throw when id not specified', async function () {
    let req = { decoded: { id: undefined }};
    await expect(userapi.getUser(req)).to.be.rejectedWith("user id not defined");
  });
});