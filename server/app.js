var express = require('express');
var pg = require('pg');

var config = require("./config");

var conString = config.conString;
var client = new Client(conString);
client.connect();

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!')
});

var server = app.listen(config.port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});

var io = require('socket.io')(server);
io.on('connection', function (socket) {

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });

  io.emit('uuid', { token: uuid });

  socket.on('myolocation', function (data) {
    io.emit('myoTracking', data);

    if (data.currentStatus) {

      client.query('INSERT INTO lines (token, line_segment, x, y) VALUES ($1, $2, $3, $4)', [data.token, data.lineSegment, data.x, data.y], function(err, result) {
        // Handle an error from the query
        if(handleError(err)) return;
        console.log("Inserted into db");
      });

    };

  });

  socket.on('createLine', function (data) {
    //console.log(data);
    io.emit('lineCreated', data);
  });

});

// Connect to the database
pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  console.log('Its working!');
});