var http = require('http');
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var path = require('path');

var port = process.env.PORT || 3500;
var mongoUrl = 'mongodb://freecodecamp:password@ds01316.mlab.com:1316/urlsdb'

app.listen(port, function () {
  console.log("Listening on port: " + port);
});

app.use('/', express.static(__dirname + "/homepage"))

app.get('/([a-zA-Z0-9])+', function (req, res) {
  mongo.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    var shortUrls = db.collection("shortUrls");
    shortUrls.find({
      littleUrl: req.url.replace("/", "")
    }).toArray(function(err, doc) {
      if (doc.length != 0) {
        res.redirect(doc[0].regUrl);
      } else {
        res.send("Sorry! That link doesn't exist");
      }
    });
  });
});

app.get('/http://[a-zA-Z]+.com', function(req, res) {
  console.log(req.get('host'));
  var origUrl = req.url.replace("/","");
  var newUrl = getLittle();
  mongo.connect(mongoUrl, function (err, db) {
    if (err) throw err;
    var shortUrls = db.collection("shortUrls");
    shortUrls.update({
      regUrl: origUrl
    }, {
      $set: {littleUrl: newUrl}
    }, {upsert: true});
    db.close();
  });
  res.json({
    original_url: origUrl,
    short_url: req.protocol + "://" + req.get('host') + "/" + newUrl
  });
});

var getLittle = function () {
  var littleCode = "";
  for (var i = 0; i < 4; i++) {
    littleCode += getRandomInt();
  }
  return littleCode;
}

var getRandomInt = function() {
  return Math.floor(Math.random() * 10);
}
