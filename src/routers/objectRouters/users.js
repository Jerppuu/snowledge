/**
API kutsut käyttäjälle

Päivityshistoria
Arttu Lakkala 15.11 Lisätty segmentit delete
Arttu Lakkala 22.11 Lisätty segmentit muutos
Arttu Lakkala 25.11 Lisätty segmentit lisäys
Arttu Lakkala 1.12  Rollback lisätty segmentin muutokseen
Arttu Lakkala 5.12 Rollback lisätty segmentin lisäykseen
Arttu Lakkala 5.12 uudelleennimettiin api.js
Arttu Lakkala 4.01 Poistettiin mahdollisuus poistaa admin
Arttu Lakkala 12.01 Siirrettiin käyttäjän teko tänne salasanatarkistuksen taakse
-----------------------------------------
Arttu Lakkala 6.12 Refactoroitiin API:sta

*/

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const util = require('util');
const database = require("./database");

const query = util.promisify(database.query).bind(database);

const saltRounds = 15;
//const secret = "Lumihiriv0";
//alusta tarkistus
const { body, validationResult } = require("express-validator");

async function getAll() {
  return await query("SELECT * FROM Kayttajat",
  function (err, result) {
    if (err) throw err;
    return result;
  });
}

async function getUser(req) {
  if(req.decoded.id === undefined)
    throw new Error("user id not defined");
  return await query("SELECT * FROM Kayttajat WHERE ID = ?",
    [
      req.decoded.id
    ],
    function (err, result) {
      if (err) throw err;
      return result;
    });
};

//kaikkien käyttäjien haku
router.get("/all", (req, res, getAll) => {
  getAll()
    .then((result) => {
      res.json(result);
      res.status(200);
    })
    .catch(err => res.status(400).json(err));
});

router.get("/", (req, res, getUser) => {
  getUser()
    .then((result) => {
      res.json(result);
      res.status(200);
    })
    .catch(err => res.status(400).json(err));
});

//käyttäjän teko
router.post("/",
  [
  // tarkista sähköposti
    body("Sähköposti").isEmail().withMessage("Ei toimiva shäköposti"),
  
    body("Etunimi").exists().withMessage("Puuttuva etunimi"),
    body("Sukunimi").exists().withMessage("Puuttuva sukunimi"),
 
    // tarkista salasanan pituus
    body("Salasana").isLength({ min: 7 }).withMessage("Salasanan oltava vähintään 7 merkkiä")
  ]
  ,function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      res.status(400);
    }
  
    else{
    //salataan salasana
      database.beginTransaction(function(err){
        if (err) throw err;
        bcrypt.hash(req.body.Salasana, saltRounds, function(err, hash) {
          database.query("INSERT INTO Kayttajat(Etunimi, Sukunimi, Sähköposti, Salasana, Rooli) VALUES(?, ?, ?, ?, ?)",
            [
              req.body.Etunimi,
              req.body.Sukunimi,
              req.body.Sähköposti,
              hash,
              req.body.Rooli ? req.body.Rooli : "operator"
            ],
            function (err) {
              if (err){database.rollback(function(){throw err;});}
              database.commit(function(err){
                if(err){database.rollback(function(){throw err;});}
                res.json("Insert was succesfull");
                res.status(204);
              });
            });
        });
      });
    }
  });

router.put("/:id", function(req, res) {
  if (req.body.Salasana) {
    bcrypt.hash(req.body.Salasana, saltRounds, function(err, hash) {
      database.query(
        `UPDATE Kayttajat
       SET 
       Etunimi=?,
       Sukunimi=?,
       Sähköposti=?,
       Salasana=?
       WHERE ID = ?
      `,
        [
          req.body.Etunimi,
          req.body.Sukunimi,
          req.body.Sähköposti,
          hash,
          req.params.id
        ],
        function (err, result) {
          if (err) throw err;
          res.json(result);
          res.status(200);
        });
    });
  } else {
    database.query(
      `UPDATE Kayttajat
      SET 
      Etunimi=?,
      Sukunimi=?,
      Sähköposti=?
      WHERE ID = ?
    `,
      [
        req.body.Etunimi,
        req.body.Sukunimi,
        req.body.Sähköposti,
        req.params.id
      ],
      function (err, result) {
        if (err) throw err;
        res.json(result);
        res.status(200);
      });
  }
  
});

router.delete("/:id", function(req, res) {
  database.query(
    `SELECT * FROM Kayttajat
   WHERE ID = ?
  `,
    [
      req.params.id
    ],
    function (err, result) {
      if (err) throw err;
      console.log(result.length);
      if(result.length < 1) {
        res.end("Poistettavaa ei löytynyt");
        res.status(404);
      }
      else if(result[0].Rooli =="admin"){
        res.end("adminia ei voi poistaa");
        res.status(401);
      }
      else{
        database.query(
          `DELETE FROM Kayttajat
         WHERE ID = ?
        `,
          [
            req.params.id
          ],
          function (err, result) {
            if (err) throw err;
            res.json(result);
            res.status(200);
          });
      }
    });
});

module.exports = { router, getUser, getAll };