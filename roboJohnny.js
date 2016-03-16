const commands = require('./robo-commands.js');
const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
  io: new Raspi()
});

// pull motor configs from ADAFRUIT_V2 template
const configs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;

// instantiate motors when board is ready
var m1;
var m2;

board.on('ready', function() {
  m1 = new five.Motor(configs.M1);
  m2 = new five.Motor(configs.M2);
});

const SPEED = 128;
const TURN_SPEED = 100;
const SPEED_MOD = 0.97;
//the time at which the last command was received
var lastCommand = -Infinity;

function runCommand (msg) {
  // don't attempt to move motors which haven't been instantiated yet
  if (!m1 || !m2) {
    console.log('motors not ready, returning...')
    return;
  }

  // only run commands in chronological order
  if (msg.time > lastCommand) {
    // store the time of the last executed command
    lastCommand = msg.time;
    // the command itself is in the property 'command' of the socket message
    var command = msg.command;

    switch(command) {
      case commands.CUSTOM:
      customSpeed(msg.dx, msg.dy);
      break;
      case commands.FORWARD:
      forward(SPEED);
      break;
      case commands.REVERSE:
      reverse(SPEED);
      break;
      case commands.TURN_LEFT:
      left(TURN_SPEED);
      break;
      case commands.TURN_RIGHT:
      right(TURN_SPEED);
      break;
      case commands.STOP:
      stop();
      break;
    }
  }
}

function custom(dx, dy) {
  var m1speed = dy - dx;
  var m2speed = dy + dx;

  if (m1speed < 0)
  m1.rev(Math.abs(m1speed));
  else m1.fwd(m1speed);

  if (m2speed < 0)
  m2.rev(Math.abs(m2speed));
  else m2.fwd(m2speed);
}
// SPEED_MOD compensates for tendency to drift to one side over time
function forward (speed) {
  m1.fwd(speed);
  m2.fwd(speed * SPEED_MOD);
}

function reverse (speed) {
  m1.rev(speed);
  m2.rev(speed * SPEED_MOD);
}

function left (speed) {
  m1.rev(speed);
  m2.fwd(speed * SPEED_MOD);
}

function right (speed) {
  m1.fwd(speed);
  m2.rev(speed * SPEED_MOD);
}

function stop() {
  m1.stop();
  m2.stop();
}

module.exports = { runCommand: runCommand };
