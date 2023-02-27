var userapi = require('../routers/objectRouters/users');
var chai = require('chai');
var assert = chai.assert;

describe('/GET user endpoint', function () {
  it('should get all users', function () {
    let user = userapi.getAll();
    assert.deepEqual(user, [
      { firstname: "first", lastname: "user", email: "first@user.com", id: 1 },
      { firstname: "second", lastname: "user", email: "second@user.com", id: 2 }
    ])
  });
});

describe('/GET user endpoint', function () {
  it('should get specific user with valid id', function () {
    let req = { decoded: { id: 1 }};
    let user = userapi.getUser(req);
    assert.deepEqual(user, [{ firstname: "first", lastname: "user", email: "first@user.com", id: 1 }])
  });
  it('should throw when id not specified', function () {
    let req = { decoded: { id: undefined }};
    assert.throws(() => userapi.getUser(req), Error, "user id not defined");
  });
});