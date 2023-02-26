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
  query(query, params) {
    switch (query) {
      case "SELECT * FROM Kayttajat WHERE ID = ?":
        const user = users.filter(obj => {
          return obj.id === parseInt(params);
        });
      default:
        return "hello world";
    }
  }
}

module.exports = testdb;