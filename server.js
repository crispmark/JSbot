// initialize express app and middleware
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/joystick', function(req, res){
  res.sendFile(__dirname + '/joystick.html');
});

// initialize http server using express app, start listening on port
const http = require('http').Server(app);
const port = 3002;
http.listen(port, function(){
  console.log('listening on *:', port);
});

// initialize socket listening
const io = require('socket.io')(http);
const CYCLE_INTERVAL = 20000;
var socketQueue = [];

// every 30 seconds, cycle the controlling socket to the end of the queue
setInterval(function(){
  var socket = socketQueue.shift();
  if (socket !== undefined) {
    socketQueue.push(socket);
  }
  // if there is still a connected socket, log their id
  if (socketQueue[0]) {
    console.log('id', socketQueue[0].id, 'now controlling...');
  }
}, CYCLE_INTERVAL);

// instantiate board and import runCommand()
const robo    = require('./roboJohnny');
const command = require('./robo-commands'); // command definitions

io.on('connection', function(socket) {
  socketQueue.push(socket);
  console.log('a user connected (id:', socket.id, ')...', socketQueue.length, 'current connections');

  //listen for commands to robot
  socket.on(command.COMMAND, function(msg) {
    if (socket === socketQueue[0]) {
      console.log('running command:', msg);
      robo.runCommand(msg); // msg contains the specific command to run
    }
  });

  socket.on('disconnect', function(){
    // find index of disconnected socket in the queue, and remove it
    var socketIndex = socketQueue.indexOf(socket);
    socketQueue.splice(socketIndex, 1);

    console.log('a user disconnected (id:', socket.id, ')');

    robo.runCommand({
      command: command.STOP,
      time: Date.now()
    });
  });
});

// run the camera socket server
require('./cameraServer');
