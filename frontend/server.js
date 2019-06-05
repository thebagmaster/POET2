var express = require("express");
var bodyParser = require('body-parser');
var multer = require('multer');
var morgan = require('morgan');
var upload = multer();
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

var pub = '/public/';
var dev = '/dev/';

var id_gap = 1000;
var id_stop = 1000;
var id_started = 2000;
var id_good = 5000;
var id_bad = 6000;

/* serves main page */
app.get("/", function(req, res) {
    res.sendFile(__dirname + pub + 'index.html');
});

/* serves dev page */
app.get("/dev/", function(req, res) {
    res.sendFile(__dirname + dev + 'index.html');
});

app.post("/dict", upload.array(), function(req, res) {
  var func = req.body.func;
  var dict = req.body.dict;
  //console.log(req.body);
  var s_db = req.body.db;
  var s_col = req.body.col;

  var mongodb = require('mongodb');
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/' + s_db;
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var col = db.collection(s_col + '_DICT');
      if(func == 0) //get
      {
        col.find().toArray(function(err, docs){
            if (err) {
              console.log(err);
            } else if (docs.length) {
              //console.log(docs);
              res.send(docs);
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              res.send("no rows");
            }
            db.close();
        });
      }else if(func == 1){ //set
        var doc = { "dict":dict, "id":1 };
        col.update({"id":1} , doc, { upsert: true }, function(err, records){
          if (err){
            console.log("Error :" + err);
            res.send("false");
          }else{
            console.log("Record added");
            res.send("true");
          }
        });
      }
    }
  });
});

app.post("/target", upload.array(), function(req, res) {
  var func = req.body.func;
  var dict = req.body.dict;
  //console.log(req.body);
  var s_db = req.body.db;
  var s_col = req.body.col;

  var mongodb = require('mongodb');
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/' + s_db;
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var col = db.collection(s_col + '_TARGET');
      if(func == 0) //get
      {
        col.find().toArray(function(err, docs){
            if (err) {
              console.log(err);
            } else if (docs.length) {
              //console.log(docs);
              res.send(docs);
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              res.send("no rows");
            }
            db.close();
        });
      }else if(func == 1){ //set
        var doc = { "targets":dict, "id":1 };
        col.update({"id":1} , doc, { upsert: true }, function(err, records){
          if (err){
            console.log("Error :" + err);
            res.send("false");
          }else{
            console.log("Record added");
            res.send("true");
          }
        });
      }
    }
  });
});

app.post("/cycle", upload.array(), function(req, res) {
  var func = req.body.func;
  var cycle = req.body.cycle;
  //console.log(req.body);
  var s_db = req.body.db;
  var s_col = req.body.col;

  var mongodb = require('mongodb');
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/' + s_db;
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var col = db.collection(s_col + '_CYCLE');
      if(func == 0) //get
      {
        col.find().toArray(function(err, docs){
            if (err) {
              console.log(err);
            } else if (docs.length) {
              //console.log(docs);
              res.send(docs);
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              res.send("no rows");
            }
            db.close();
        });
      }else if(func == 1){ //set
        var doc = { "cycle":cycle, "id":1 };
        col.update({"id":1} , doc, { upsert: true }, function(err, records){
          if (err){
            console.log("Error :" + err);
            res.send("false");
          }else{
            console.log("Record added");
            res.send("true");
          }
        });
      }
    }
  });
});


app.post("/shift", upload.array(), function(req, res) {
  var func = req.body.func;
  var start = req.body.start;
  var end = req.body.end;
  var shift = parseInt(req.body.shift);
  var days = parseInt(req.body.days);
  var dts = req.body.dts;
  //console.log(req.body);
  var s_db = req.body.db;
  var s_col = req.body.col;

  var mongodb = require('mongodb');
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/' + s_db;
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var col = db.collection(s_col + '_SHIFTS');
      if(func == 0) //get
      {
        if(shift == 0){
          col.find({},{"sort": "start"}).toArray(function(err, docs){
              if (err) {
                console.log(err);
              } else if (docs.length) {
                //console.log(docs);
                res.send(docs);
              } else {
                console.log('No document(s) found with defined "find" criteria!');
                res.send("no rows");
              }
              db.close();
          });
        }else{
          col.find({"shift":shift},{"sort": "start"}).toArray(function(err, docs){
              if (err) {
                console.log(err);
              } else if (docs.length) {
                //console.log(docs);
                res.send(docs);
              } else {
                console.log('No document(s) found with defined "find" criteria!');
                res.send("no rows");
              }
              db.close();
          });
        }
      }
      else if(func == 1) //insert
      {
        var doc = { "shift":shift, "start":start, "end":end, "days":days, "dts":dts };
        col.update({"shift":shift} , doc, { upsert: true }, function(err, records){
          if (err){
            console.log("Error :" + err);
            res.send("false");
          }else{
            console.log("Record added");
            res.send("true");
          }
        });
      }
      else if(func == 2) //remove
      {
        col.remove({ "shift":shift, "start":start, "end":end, "days":days, "dts":dts }, function(err, records){
          if (err){
            console.log("Error :" + err);
            res.send("false");
          }else{
            console.log("Record removed");
            res.send("true");
          }
        });
      }
      db.close();
    }
  });
});

/* serves data page */
// 0 : good/bad parts segmented
// 1 : oee stats total data
// 2 : availablility total data
// 3 : good/bad parts total data
app.post("/data", upload.array(), function(req, res) {
    //console.log(req.body.start);
    var start = parseInt(req.body.start);
    var end = start + parseInt(req.body.end); //to seconds from mins
    var step = parseInt(req.body.step);
    var type = parseInt(req.body.type);
    var s_db = req.body.db;
    var s_col = req.body.col;
    var s_shft = req.body.shift;
    for(var i = 0; i < s_shft.length; i++)
      s_shft[i] = parseInt(s_shft[i]);
    //console.log(s_shft);

    var gap = end-start;
    var hour = 60*60;
    var day = 24*hour;
    var day3 = day*3;
    var week2 = 2*7*day;
    var conc = '';

    if(type == 2){
      if(gap >= week2)
          conc = '_D';
      else if(gap >= day)
          conc = '_H';
      else if(gap >= hour)
          conc = '_M';
    }else {
      if(gap >= week2)
          conc = '_D';
      else if(gap > day)
          conc = '_H';
      else if(gap >= hour)
          conc = '_M';
    }

    //var type = 0;

    //console.log(conc);
    //console.log(end);
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/' + s_db;
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        if(type == 0)
        {
            if(conc == '')
            {
                var col = db.collection(s_col);
                //console.log('Connection established to', url);
                col.aggregate([
                {$match : {"time": {$gte: start, $lt: end}}},
                { $sort : { "time" : 1} },
                {$project: {timebins: {$subtract: ["$time",{$mod:["$time",step]}]},
                            less: {$cond: [ {$and: [ { $lt: ["$event", id_bad ] },  { $gte: ["$event", id_good ] }]}, 1, 0]},
                            more: {$cond: [ {$gte: ["$event", id_bad ] }, 1, 0]},
                            total: {$cond: [ {$gte: ["$event", id_good ] }, 1, 0]}
                    }
                },
                {$group: {
                   "_id":"$timebins",
                   "good":{$sum:"$less"},
                   "bad":{$sum:"$more"},
                   "total":{$sum:"$total"}

                }}]).sort({'_id':-1}).toArray(function (err, result) {
                  if (err) {
                    console.log(err);
                  } else if (result.length) {
                    console.log(result);
                    res.send(result);
                  } else {
                    console.log('No document(s) found with defined "find" criteria!');
                    res.send("no rows");
                  }
                  db.close();
                });
            }
            else
            {
                var col = db.collection(s_col + conc);

                col.aggregate([
                {$match : {"time": {$gte: start, $lt: end}}},
                {$match : {"shift": {$in: s_shft }}},
                { $sort : { "time" : 1} },
                {$project: {timebins: {$subtract: ["$time",{$mod:["$time",step]}]},
                            less: {$cond: [ {$and: [ { $lt: ["$event", id_bad ] },  { $gte: ["$event", id_good ] }]}, '$qty', 0]},
                            more: {$cond: [ {$gte: ["$event", id_bad ] }, '$qty', 0]},
                            total: {$cond: [ {$gte: ["$event", id_good ] }, '$qty', 0]}
                    }
                },
                {$group: {
                   "_id":"$timebins",
                   "total":{$sum:"$total"},
                   "good":{$sum:"$less"},
                   "bad":{$sum:"$more"}

                }}]).sort({'_id':-1}).toArray(function (err, result) {
                  if (err) {
                    console.log(err);
                  } else if (result.length) {
                    //console.log(result);
                    res.send(result);
                  } else {
                    console.log('No document(s) found with defined "find" criteria!');
                    res.send("no rows");
                  }
                  db.close();
                });
            }
        }
        else if(type == 1){
          if(conc == '')
          {
              var col = db.collection(s_col);
              //console.log('Connection established to', url);
              col.aggregate([
              {$match : {"time": {$gte: start, $lt: end}}},
              {$project: {
                          less: {$cond: [ {$and: [ { $lt: ["$event", id_bad ] },  { $gte: ["$event", id_good ] }]}, 1, 0]},
                          more: {$cond: [ {$gte: ["$event", id_bad ] }, 1, 0]},
                          total: {$cond: [ {$gte: ["$event", id_good ] }, 1, 0]}
                  }
              },
              {$group: {
                _id : "1",
                 "total":{$sum:"$total"},
                 "good":{$sum:"$less"},
                 "bad":{$sum:"$more"}

              }}]).toArray(function (err, result) {
                if (err) {
                  console.log(err);
                } else if (result.length) {
                  //console.log(result);
                  res.send(result);
                } else {
                  console.log('No document(s) found with defined "find" criteria!');
                  res.send("no rows");
                }
                db.close();
              });
          }
          else
          {
              var col = db.collection(s_col + conc);

              col.aggregate([
              {$match : {"time": {$gte: start, $lt: end}}},
              {$match : {"shift": {$in: s_shft }}},
              {$project: {
                          less: {$cond: [ {$and: [ { $lt: ["$event", id_bad ] },  { $gte: ["$event", id_good ] }]}, '$qty', 0]},
                          more: {$cond: [ {$gte: ["$event", id_bad ] }, '$qty', 0]},
                          total: {$cond: [ {$gte: ["$event", id_good ] }, '$qty', 0]}
                  }
              },
              {$group: {
                _id : "1",
                 "total":{$sum:"$total"},
                 "good":{$sum:"$less"},
                 "bad":{$sum:"$more"}
              }}]).toArray(function (err, result) {
                if (err) {
                  console.log(err);
                } else if (result.length) {
                  //console.log(result);
                  res.send(result);
                } else {
                  console.log('No document(s) found with defined "find" criteria!');
                  res.send("no rows");
                }
                db.close();
              });
          }
        }else if(type == 2){
          if(conc == '')
          {
              var col = db.collection(s_col);
              //console.log('Connection established to', url);
              col.find({"time": {$gte: start, $lt: end}, "event": {$lte: id_started+id_gap }}).sort({$natural:-1})
              .toArray(function (err, result) {
                if (err) {
                  console.log(err);
                } else if (result.length) {
                  col.find({"time":{$lt: start}, "event": {$lte: id_started+id_gap },"shift": {$in: s_shft }}).limit(1).sort({$natural:-1}).toArray(function (err, result2) {
                      if (result2.length)
                        result[0]["start"] = result2[0].event;
                      //console.log(result);
                      res.send(result);
                  });
                } else {
                  //console.log('No document(s) found with defined "find" criteria!');
                  col.find({"time":{$lt: start}, "event": {$lte: id_started+id_gap },"shift": {$in: s_shft }}).limit(1).sort({$natural:-1}).toArray(function (err, result2) {
                      result = [{data:"no rows"}];
                      if (result2.length)
                        result[0]["start"] = result2[0].event;
                      //console.log(result);
                      res.send(result);
                  });
                }
                db.close();
              });
          }
          else
          {
              var col = db.collection(s_col + conc);
              col.find({"time": {$gte: start, $lt: end}, "event": {$lte: id_started+id_gap },"shift": {$in: s_shft }}).sort( { "time": 1 } )
              .toArray(function (err, result) {
                if (err) {
                  console.log(err);
                } else if (result.length) {
                  //console.log(result);
                  res.send(result);
                } else {
                  console.log('No document(s) found with defined "find" criteria!');
                  res.send("no rows");
                }
                db.close();
              });
          }
        }else if(type == 3){
          if(conc == '')
          {
              var col = db.collection(s_col);
              //console.log('Connection established to', url);
              col.aggregate([
              {$match : {"time": {$gte: start, $lt: end}, "event": {$gte: id_bad }}},
              {$group: {
                _id:"$event",
                qty:{$sum:1}
                }}
              ]).sort({"_id":1})
              .toArray(function (err, result) {
                if (err) {
                  console.log(err);
                } else if (result.length) {
                  //console.log(result);
                  res.send(result);
                } else {
                  console.log('No document(s) found with defined "find" criteria!');
                  res.send("no rows");
                }
                db.close();
              });
          }
          else
          {
              var col = db.collection(s_col + conc);
              col.aggregate([
              {$match : {"time": {$gte: start, $lt: end}, "event": {$gte: id_bad }}},
              {$match : {"shift": {$in: s_shft }}},
              {$group: {
                _id:"$event",
                qty:{$sum:"$qty"}
                }}
              ]).sort({"_id":1})
              .toArray(function (err, result) {
                if (err) {
                  console.log(err);
                } else if (result.length) {
                  //console.log(result);
                  res.send(result);
                } else {
                  console.log('No document(s) found with defined "find" criteria!');
                  res.send("no rows");
                }
                db.close();
              });
          }
        }
      }
    });
});

/* serves all the static files */
app.get(/^(.+)$/, function(req, res){
    console.log('static file request : ' + req.params[0]);
    if (req.params[0].substring(0, 4) == "/dev")
        res.sendFile( __dirname + req.params[0]);
    else
        res.sendFile( __dirname + pub + req.params[0]);
});

var port = 80;
app.listen(port, function() {
    console.log("Listening on " + port);
});
