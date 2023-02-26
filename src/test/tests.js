var userapi = require('../routers/objectRouters/users');
var chai = require('chai');  
var assert = chai.assert;

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('/GET user endpoint', function () {
    it('should get all users', function () {
        const req = {
          decoded: {
            id: 1
          }
        };
        const user = userapi.getUser(req);
        //assertit
    });
});