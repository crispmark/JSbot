const PythonShell = require('python-shell');
const command = require('./robo-commands.js');

const SPEED = 64;
const TURN_SPEED = 64;
//the time at which the last command was received
var lastCommand = -Infinity;

// runs commands received as messages (on the socket connection in server.js)
function runCommand (msg) {
  if (msg.time > lastCommand) {
    lastCommand = msg.time;
    switch(msg.command) {
      case command.FORWARD:
      runMotor(1, SPEED, 2, SPEED);
      break;
      case command.REVERSE:
      runMotor(1, -SPEED, 2, -SPEED);
      break;
      case command.TURN_LEFT:
      runMotor(1, TURN_SPEED, 2, -TURN_SPEED);
      break;
      case command.TURN_RIGHT:
      runMotor(1, -TURN_SPEED, 2, TURN_SPEED);
      break;
      case command.STOP:
      runMotor(1, 0, 2, 0);
      break;
    }
  }
}

function runMotor(lmotor, lspeed, rmotor, rspeed) {
  var pyshell = new PythonShell('./motorControl.py', {
    pythonPath: 'python2',
  });
  // sends a message to the Python script via stdin
  pyshell.send(JSON.stringify({left: {motor: lmotor, speed: lspeed}, right: {motor: rmotor, speed: rspeed}}));

  // end the input stream and allow the process to exit
  pyshell.end(function (err) {
    if (err) throw err;
  });
}

module.exports = {
  runCommand: runCommand
}
