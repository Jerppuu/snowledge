var users = [
  {
    firstname: "first",
    lastname: "user",
    email: "first@user.com",
    id: 1
  },
  {
    firstname: "second",
    lastname: "user",
    email: "second@user.com",
    id: 2
  },
];

var testdb = {
  query(query, params, callback) {
    switch (query) {
      case "SELECT * FROM Kayttajat WHERE ID = ?":
        const user = users.filter(obj => {
          return obj.id === parseInt(params);
        });
        return callback(null, user);
      
        case "SELECT * FROM Kayttajat":
          return params(null, users); 

      default:
        return "hello world";
    }
  }
}

module.exports = testdb;