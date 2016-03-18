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
const port = 3000;
http.listen(port, function(){
  console.log('listening on *:', port);
});



// instantiate board and import runCommand()
const robo    = require('./roboJohnny');
const command = require('./robo-commands'); // command definitions

// initialize socket listening
const io = require('socket.io')(http);
const CYCLE_INTERVAL = 60000;
const TIME_UPDATE = 'timeUpdate';
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
  var position = socketQueue.length;
  socketQueue.push(socket);

  //first user connect
  if (position === 0) {
    // this is the first connected client, so start the interval and their turn
    interval = setInterval(cycleSockets, CYCLE_INTERVAL);
    lastCycle = Date.now();
    socket.emit(TIME_UPDATE, {control: true, time: getTimeLeft(position)})
  }
  //other user connect
  else {
    socket.emit(TIME_UPDATE, {control: false, time: getTimeLeft(position)})
  }

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
    //remove socket from queue
    socketQueue.splice(socketIndex, 1);
    //first user disco
    if (socketIndex === 0) {
      robo.runCommand({
        command: command.STOP,
        time: Date.now()
      });

      clearInterval(interval);
      interval = setInterval(cycleSockets, CYCLE_INTERVAL);
      lastCycle = Date.now();
      updateAll();
    }
    //other user disco
    else {
      updateAll();
    }
    if (socketQueue.length === 0) {
      clearInterval(interval);
    }

    console.log('a user disconnected (id:', socket.id, ')');
  });
});

//updates all users of their current time left
function updateAll() {
  for (var i = 0; i < socketQueue.length; i++) {
    var control = (i === 0);
    socketQueue[i].emit(TIME_UPDATE, {control: control, time: getTimeLeft(i)} )
  }
}

// returns time left in current cycle
function getTimeLeft(position) {
  // calculate amount of time elapsed in current cycle
  var switchTime = CYCLE_INTERVAL - (Date.now() - lastCycle);
  // calculate time left until connected client will have their turn
  if (position === 0) {
    return switchTime
  }
  else {
    return switchTime + CYCLE_INTERVAL*(position - 1)
  }
}

// run the camera socket server
require('./cameraServer');
