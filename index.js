var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(8080, function () {
	// transports: ['xhr-polling']
	transports: ['websocket']
  console.log('Server listening at port 8080');
});

app.use(express.static(__dirname + '/public'));
var numberOfUsers = 0;

io.set('transports', ['websocket']);
// io.set('transports', ['polling']);

io.on('connection', function (socket) {
  var addedUser = false;
  socket.on('new message', function (data) {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', function (username) {
    if (addedUser) return;

    socket.username = username;
    ++numberOfUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numberOfUsers
    });
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numberOfUsers
    });
  });

  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function () {
    socket.broadcast.emit('stopTyping', {
      username: socket.username
    });
  });

  socket.on('disconnect', function () {
    if (addedUser) {
      --numberOfUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numberOfUsers
      });
    }
  });
});
