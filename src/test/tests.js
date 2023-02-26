var userapi = require('../routers/objectRouters/users');
var chai = require('chai');  
var assert = chai.assert;

describe('/GET user endpoint', function () {
  it('should get all users', function () {
      const req = {
        decoded: {
          id: 1
        }
      };
      const user = userapi.getAll();
      assert.deepEqual(user, [{firstname: "first", lastname: "user", email: "first@user.com", id: 1},{firstname: "second", lastname: "user", email: "second@user.com", id: 2}])
  });
});

describe('/GET user endpoint', function () {
    it('should get specific user', function () {
        const req = {
          decoded: {
            id: 1
          }
        };
        const user = userapi.getUser(req);
        assert.deepEqual(user, [{firstname: "first", lastname: "user", email: "first@user.com", id: 1}])
    });
});