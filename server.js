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
var lastCycle = 0; // keeps track of last time sockets were cycled

// every CYCLE_INTERVAL, cycle the sockets to give someone else control
function cycleSockets() {
  lastCycle = Date.now();

  // remove the controlling socket and push it to the end of the queue
  var socket = socketQueue.shift();
  if (socket !== undefined) {
    socket.emit('turn end'); // tell the old client that their turn is over
    socketQueue.push(socket);
  }
  // if there is still a connected socket, tell them they're in control
  var newSocket = socketQueue[0];
  if (newSocket) {
    newSocket.emit('turn begin');
    console.log('id', newSocket.id, 'now controlling...');
  }
}



// instantiate board and import runCommand()
const robo    = require('./roboJohnny');
const command = require('./robo-commands'); // command definitions

io.on('connection', function(socket) {
  var interval;

  if (socketQueue.length === 0) {
    // this is the first connected client, so start the interval and their turn
    interval = setInterval(cycleSockets, CYCLE_INTERVAL);
    lastCycle = Date.now();
    socket.emit('turn begin');
  }
  else {
    // calculate amount of time elapsed in current cycle
    var cycleTimeElapsed = Date.now() - lastCycle;

    // calculate time left until connected client will have their turn
    var timeLeft = CYCLE_INTERVAL * socketQueue.length - cycleTimeElapsed;
    socket.emit('time left', timeLeft);
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

    for (var i = socketIndex; i < socketQueue.length; i++) {
      // send the clients the CYCLE_INTERVAL so they know how much to subtract
      socketQueue[i].emit('update time left', CYCLE_INTERVAL);
    }

    console.log('a user disconnected (id:', socket.id, ')');

    if (socketIndex === 0) {
      robo.runCommand({
        command: command.STOP,
        time: Date.now()
      });
    }

    if (socketQueue.length === 0) {
      clearInterval(interval);
    }
  });
});

// run the camera socket server
require('./cameraServer');
