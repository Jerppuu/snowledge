const mysql = require("mysql2");
const testdb = require("./testdb");

var con = null;

if (NODE_ENV = "test") {
  con = testdb;
} else {
  //modify if database changes
  con = mysql.createConnection({
    host: "localhost",
    user: "pallas",
    password: "testpass",
    database: "pallas"
  });
}

module.exports = con;