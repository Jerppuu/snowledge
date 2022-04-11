/**
Using cron schedule, function gets number of segments and makes loop of same length.
In this loop, function gets the newest user review about the segment from KayttajaArviot-table.
After checking that user review is newer than segment update, either it updates or inserts it to Paivitykset-table.
**/

const cron = require("node-cron");
const date = require("date-and-time");
const database = require("./routers/objectRouters/database");

//SQL Functions to read and modify database
const sqlQuery = (query) => {
  return new Promise (function (resolve, reject){
    database.query(query, function (err, results){
      if (err) {reject(err);}
      resolve(results);
    });
  });
};

const sqlInsert = (data, segment) => {
  return new Promise (function (resolve, reject) {
    database.query("UPDATE Paivitykset SET Arvio_ID1=?, Arvio_ID2=?, Arvio_ID3=? WHERE Segmentti=? order by Aika desc limit 1;",
      [
        data[0],
        data[1],
        data[2],
        segment
      ],
      function (err,results){
        if (err) {reject(err);}
        resolve(results);
      });
  });
};

const sqlUpdate = (data, segment, timeString) => {
  return new Promise (function (resolve, reject){
    database.query("INSERT INTO Paivitykset (Aika, Segmentti, Arvio_ID1, Arvio_ID2, Arvio_ID3)  VALUES (?, ?, ?, ?, ?);",
      [
        timeString,
        segment,
        data[0],
        data[1],
        data[2]         
      ],
      function (err,results){
        if (err) {reject(err);}
        resolve(results);
      });
  });
};


function isObjectEmpty(obj) {
  return Object.keys(obj).length;
}

function guideInfoExists(obj) {
  if(isObjectEmpty(obj) === 0) {
    return false;
  }

  if(obj[0].Lumilaatu_ID1 === null && obj[0].Lumilaatu_ID2 === null) {
    return false;
  }
  
  return true;
}


//
const userReviewUpdater = cron.schedule("*/1 * * * *", async () => {
  console.log("Updating user reviews...");
  let newestUpdate;
  let timeLimit;

  const segmentCount = await sqlQuery("SELECT ID FROM Segmentit order by ID desc limit 1;").then(function (results) {
    results = JSON.parse(JSON.stringify(results));
    return results[0].ID;
  });


  for (let i=0; i<segmentCount; i++){
    const segmentQuery = "SELECT Aika, Segmentti, Lumilaatu_ID1, Lumilaatu_ID2 FROM Paivitykset WHERE Segmentti = " + (i + 1) + " AND Aika > NOW() - INTERVAL 3 DAY ORDER BY Aika DESC LIMIT 1;";

    const segmentUpdate = await sqlQuery(segmentQuery).then(function (results){
      results=JSON.parse(JSON.stringify(results));
      return results;
    });
    
    if(guideInfoExists(segmentUpdate)) {
      newestUpdate = "\"" + date.format(new Date(segmentUpdate[0].Aika), "YYYY-MM-DD HH:mm:ss", true) + "\"";
      timeLimit = "NOW() - INTERVAL 1 DAY";
    } else {
      newestUpdate = "NOW() - INTERVAL 3 DAY";
      timeLimit = "NOW() - INTERVAL 3 DAY";
    }
    
    const userReviewQuery = "SELECT ID, Segmentti, Lumilaatu, Aika FROM KayttajaArviot WHERE Segmentti = " + (i + 1) + " AND Aika >= " + newestUpdate + " AND Aika >= " + timeLimit + " order by Aika desc;";

    const userReview = await sqlQuery(userReviewQuery).then(function (results){
      results=JSON.parse(JSON.stringify(results));
      return results;
    });

    
    if (isObjectEmpty(userReview) !== 0){
      console.log("Updating segment " + (i+1) + "...");
      const itemCount = userReview.length;
      const timeString = date.format(new Date(userReview[itemCount-1].Aika), "YYYY-MM-DD HH:mm:ss", true);
      const segment = userReview[0].Segmentti;
      const maxReviewsShown = 3;

      let data = [null, null, null];
      let reviewCount = 0;
      for (let j=0; j < itemCount; j++) {
        if(reviewCount === maxReviewsShown) {
          break;
        }

        //Include reviews that have snow type 
        if(userReview[j].Lumilaatu !== null) {
          console.log(userReview[j]);
          data[reviewCount] = userReview[j].ID;
          reviewCount += 1;
        }
      }
      
      if(isObjectEmpty(segmentUpdate) !==0){
        await sqlInsert(data, segment).then(function (){
          console.log("Segment updated");
        });
      }
      else {
        await sqlUpdate(data, segment, timeString).then(function (){
          console.log("Segment added");
        });
      }
    }
  }

  console.log("All segments updated");
});

module.exports = userReviewUpdater;