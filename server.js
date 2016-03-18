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



// instantiate board and import runCommand()
const robo    = require('./roboJohnny');
const command = require('./robo-commands'); // command definitions

// initialize socket listening
const io = require('socket.io')(http);
const CYCLE_INTERVAL = 60000;
var socketQueue = [];
var lastCycle = 0; // keeps track of last time sockets were cycled

// every CYCLE_INTERVAL, cycle the sockets to give someone else control
function cycleSockets() {
  lastCycle = Date.now();

  // remove the controlling socket and push it to the end of the queue
  var socket = socketQueue.shift();

  if (socket) {
    socket.emit('control inactive', {timeLeft: getTimeLeft()}); // tell the old client that their turn is over
    socketQueue.push(socket);
  }

  // stop the previous user's command
  robo.runCommand({
    command: command.STOP,
    time: Date.now()
  });

  // if there is still a connected socket, tell them they're in control
  var newSocket = socketQueue[0];

  if (newSocket) {
    newSocket.emit('control active', {cycleInterval: CYCLE_INTERVAL});
    console.log('id', newSocket.id, 'now controlling...');
  }
}



io.on('connection', function(socket) {
  var interval;

  if (socketQueue.length === 0) {
    // this is the first connected client, so start the interval and their turn
    interval = setInterval(cycleSockets, CYCLE_INTERVAL);
    lastCycle = Date.now();
    socket.emit('control active', {cycleInterval: CYCLE_INTERVAL});
  }
  else {
    socket.emit('control inactive', {timeLeft: getTimeLeft()});
  }

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

    if (socketIndex === 0) {
      robo.runCommand({
        command: command.STOP,
        time: Date.now()
      });

      io.emit('user disconnect', {timeToSubtract: CYCLE_INTERVAL - (Date.now() - lastCycle)});

      var newSocket = socketQueue[0];

      if (newSocket) {
        newSocket.emit('control active', {cycleInterval: CYCLE_INTERVAL});
        console.log('id', newSocket.id, 'now controlling...');
      }

      clearInterval(interval);
      interval = setInterval(cycleSockets, CYCLE_INTERVAL);
      lastCycle = Date.now();
    }
    else {
      for (var i = socketIndex; i < socketQueue.length; i++) {
        // send the clients the CYCLE_INTERVAL so they know how much to subtract
        socketQueue[i].emit('user disconnect', {timeToSubtract: CYCLE_INTERVAL});
      }
    }

    if (socketQueue.length === 0) {
      clearInterval(interval);
    }

    console.log('a user disconnected (id:', socket.id, ')');
  });
});

// returns time left in current cycle
function getTimeLeft() {
  // calculate amount of time elapsed in current cycle
  var cycleTimeElapsed = Date.now() - lastCycle;
  // calculate time left until connected client will have their turn
  var timeLeft = CYCLE_INTERVAL * socketQueue.length - cycleTimeElapsed;

  return timeLeft;
}

// run the camera socket server
require('./cameraServer');
