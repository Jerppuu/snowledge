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
  query(query, opt1, opt2) {
    const callback = opt2 === undefined ? opt1 : opt2;

    switch (query) {
      case "SELECT * FROM Kayttajat WHERE ID = ?":
        const user = users.filter(obj => {
          return obj.id === parseInt(opt1);
        });
        return callback(null, user);
      
        case "SELECT * FROM Kayttajat":
          return callback(null, users); 

      default:
        return "hello world";
    }
  }
}

module.exports = testdb;