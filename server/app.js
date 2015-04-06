var express = require('express');
var pg = require('pg');

var config = require("./config");

var conString = config.conString;

var app = express();
var users = {};

app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.sendfile('./views/index.html');
});

app.get('/world', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	
	pg.connect(conString, function(err, client, done) {
		client.query('SELECT * FROM lines ORDER BY line_segment, id', function(err, result) {
			//call `done()` to release the client back to the pool
			done();

			if(err) {
				return console.error('error running query', err);
			}
			
			client.end();
			res.end(JSON.stringify(result.rows));
		});
	});
});

app.get('/clear', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  users = {};
  pg.connect(conString, function(err, client, done) {
    client.query('DELETE FROM lines', function(err, result) {
      //call `done()` to release the client back to the pool
      done();

      if(err) {
        res.end(JSON.stringify({status: "failed"}));
      }
      
      client.end();
      res.end(JSON.stringify({status: "ok"}));
    });
  });
  
});

var server = app.listen(config.port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Collavrate listening at http://%s:%s', host, port)

});

var io = require('socket.io')(server);
io.on('connection', function (socket) {

  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });

  io.emit('uuid', { token: uuid });

  console.log(users);
  users[uuid] = 1;
  socket.emit('currentUsers', Object.keys(users)); 

  socket.on('myolocation', function (data) {
    io.emit('myoTracking', data);

    if (data.currentStatus) {
      pg.connect(conString, function(err, client, done) {
        client.query('INSERT INTO lines (token, line_segment, x, y, z) VALUES ($1, $2, $3, $4, $5)', [data.token, data.lineSegment, data.x, data.y, data.z], function(err, result) {
          // Handle an error from the query
          if (err) console.log(err);
          done();
        });
      });
    };

  });

  socket.on('createLine', function (data) {
    //console.log(data);
    io.emit('lineCreated', data);
  });

});
