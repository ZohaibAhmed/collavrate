var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!')
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});

var io = require('socket.io')(server);
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('myolocation', function (data) {
    console.log(data);
  });
});
