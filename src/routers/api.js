/**
API kutsut tietokannalle


Päivityshistoria
Arttu Lakkala 15.11 Lisätty segmentit delete
Arttu Lakkala 22.11 Lisätty segmentit muutos
Arttu Lakkala 25.11 Lisätty segmentit lisäys
Arttu Lakkala 1.12  Rollback lisätty segmentin muutokseen
Arttu Lakkala 5.12 Rollback lisätty segmentin lisäykseen
Arttu Lakkala 5.12 uudelleennimettiin api.js
Arttu Lakkala 6.12 Refactoroitiin object Routtereihin
Arttu Lakkala 12.01 Käyttäjän teko viety

*/
const express = require("express");
const router = express.Router();
const database = require("./objectRouters/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const users = require("./objectRouters/users");
const updates = require("./objectRouters/updates");
const segments = require("./objectRouters/segments");
//alusta salaukset
const saltRounds = 15;
const secret = "Lumihiriv0";
//alusta tarkistus
const { body, validationResult } = require("express-validator");

//käyttäjä sisäänkirjautuminen
router.post("/user/login", function(req, res) {
  database.query("SELECT * FROM Kayttajat WHERE Sähköposti = ?",[req.body.Sähköposti], function (err, result) {
    if (err) throw err;
    if(result.length == 1){
      let user = result[0];
      bcrypt.compare(req.body.Salasana, user.Salasana, function(err, login) {
        if (login) {
          jwt.sign({ id: user.ID, Sahkoposti: user.Sähköposti }, secret, { algorithm: "HS256" }, function(err, token) {
            res.json(
              { 
                token: token, 
                user: {
                  Etunimi: user.Etunimi,
                  Sukunimi: user.Sukunimi,
                  ID: user.ID,
                  Rooli: user.Rooli,
                  Sähköposti: user.Sähköposti
                } 
              }
              
            ); 
            res.status(200);
          });
        }
        else{
          res.json("incorrect password");
          res.status(401);
        }
      });
    }
    else
    {
      res.json("No User Found");
      res.status(401);
    }
  });
});



//segmenttien haku
router.get("/segments", function(req, res) {
  //get points from database
  database.query("SELECT * FROM Koordinaatit ORDER BY Segmentti", function (err, points, fields) {
    if (err) throw err;
    //transfere needed data to array
    const coordsForSegments = points.map((item) => {
      item.Sijainti.lat = item.Sijainti.x;
      item.Sijainti.lng = item.Sijainti.y;
      delete item.Sijainti.x;
      delete item.Sijainti.y;
      return [item.Segmentti, item.Sijainti];
    });
      //get segments from database
      
    database.query("SELECT * FROM Segmentit", function (err, result) {
      let pointsDict = [];
      //create dictionary of arrays
      result.forEach(obj =>{
        pointsDict[obj.ID] = [];
      });
      //Fill points to it
      coordsForSegments.forEach(obj =>{
        pointsDict[obj[0]].push(obj[1]);
      });
      //add arrays from dict to result as object properties
      result.forEach(obj =>{
        obj.Points = pointsDict[obj.ID];
      });
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3002");
      res.json(result);
      res.status(200);        
    });
  });
});

//segmentin tuoreimman päivityksen haku
router.get("/segments/update/:id", function(req, res) {
  database.query(
    `SELECT Tekija, Segmentti, Aika, Kuvaus, Lumilaatu_ID1, Lumilaatu_ID2,Toissijainen_ID1 ,Toissijainen_ID2, Arvio_ID1, Arvio_ID2, Arvio_ID3
  FROM Paivitykset
  WHERE (Segmentti, Aika)
  IN
  (SELECT Segmentti, MAX(Aika)
    FROM Paivitykset
    WHERE Segmentti = ?
    GROUP BY(Segmentti)
   )
   ORDER BY(Segmentti)`,
    [
      req.params.id
    ],
    function (err, result, fields) {
      if (err) throw err;
      res.json(result);
      res.status(200);
    });
});


//päivitysten haku
router.get("/segments/update", function(req, res) {
  database.query(
    `SELECT P.Segmentti, P.Aika, P.Kuvaus, P.Lumilaatu_ID1, P.Lumilaatu_ID2, P.Toissijainen_ID1, P.Toissijainen_ID2, 
      a1.Aika AS A1_Aika, a1.Lumilaatu AS A1_Lumilaatu, a1.Lisätiedot AS A1_Lisätiedot, 
      a2.Aika AS A2_Aika, a2.Lumilaatu AS A2_Lumilaatu, a2.Lisätiedot AS A2_Lisätiedot, 
      a3.Aika AS A3_Aika, a3.Lumilaatu AS A3_Lumilaatu, a3.Lisätiedot AS A3_Lisätiedot
      FROM Paivitykset P
      LEFT JOIN KayttajaArviot a1 ON P.Arvio_ID1 = a1.ID
      LEFT JOIN KayttajaArviot a2 ON P.Arvio_ID2 = a2.ID
      LEFT JOIN KayttajaArviot a3 ON P.Arvio_ID3 = a3.ID
      WHERE (P.Segmentti, P.Aika)
      IN
      (SELECT Segmentti, MAX(Aika)
        FROM Paivitykset
        GROUP BY(Segmentti)
       )
       AND P.Aika > NOW() - INTERVAL 3 DAY
       ORDER BY(P.Segmentti);`,
    function (err, result, fields) {
      if (err) throw err;
      res.json(result);
      res.status(200);
    });
});


//segmentin uusimman arvion haku
router.get("/reviews", function(req, res) {
  database.query(
    `SELECT ID, Aika, Segmentti, Lumilaatu, Lisätiedot, Kommentti
  FROM KayttajaArviot
  WHERE (Segmentti, Aika)
  IN
  (SELECT Segmentti, MAX(Aika)
    FROM KayttajaArviot
    GROUP BY(Segmentti)
   )
   AND Aika > NOW() - INTERVAL 3 DAY
   ORDER BY(Segmentti)`,
    function (err, result, fields) {
      if (err) throw err;
      res.json(result);
      res.status(200);
    });
});

//Kaikkien arvioiden haku
router.get("/allReviews", function(req, res) {
  database.query(
    `SELECT KayttajaArviot.Aika, KayttajaArviot.Lisätiedot, KayttajaArviot.Lumilaatu, KayttajaArviot.Kommentti, Lumilaadut.Nimi AS Lumi, Segmentit.Nimi AS Segmentti
    FROM KayttajaArviot
    LEFT JOIN Lumilaadut ON KayttajaArviot.Lumilaatu=Lumilaadut.ID
    LEFT JOIN Segmentit ON KayttajaArviot.Segmentti=Segmentit.ID
    WHERE Aika > NOW() - INTERVAL 1 WEEK
    ORDER BY (Aika) DESC`,
    function (err, result, fields) {
      if (err) throw err;
      res.json(result);
      res.status(200);
    });
});


//lumilaatujen haku
router.get("/lumilaadut", function(req, res) {
  database.query("Select * FROM Lumilaadut", 
    function(err, result, fields) {
      if (err) throw err;
      res.json(result);
      res.status(200);
    });
});



//Arvioinnin lisääminen lumi-informaatioon
router.post("/review/:id", function(req, res) {
  
  if(req.body.Segmentti != req.params.id)
  {
    res.json("Segmentti numerot eivät täsmää");
    res.status(400);
  }
  database.query("INSERT INTO KayttajaArviot(Aika, Segmentti, Lumilaatu, Lisätiedot, Kommentti) VALUES(NOW(), ?, ?, ?, ?)",
    [ 
      req.body.Segmentti,
      req.body.Lumilaatu,
      req.body.Lisätiedot,
      req.body.Kommentti
    ],
    function (err) {
      if (err) throw err;

      database.query("SELECT LAST_INSERT_ID()", function (err, result) {
        if (err) throw err;

        res.json(result);
        res.status(204);
      });
    });
});

router.post("/updateReview/:id", function(req, res) {
  database.query(
  `UPDATE KayttajaArviot 
    SET Kommentti = ?
    WHERE ID = ? `,
    [
      req.body.Kommentti,
      req.params.id
    ],
    function (err, result) {
      if (err) throw err;
      res.json(result);
      res.status(200);
    });
});




//Salasanan tarkistus

router.use(function(req, res, next) {
  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith("Bearer ")) {
      var token = req.headers.authorization.slice(7, req.headers.authorization.length);
      jwt.verify(token, secret, function(err, decoded) {
        if(err) res.sendStatus(401);
        else {
          //jos kirjautuminen onnistuu kirjataan jääneet tiedot muistiin
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }

});

//object routers
router.use("/user/", users);
router.use("/segment/", segments);
router.use("/update/", updates);


module.exports = router;


