const commands = require('./robo-commands.js');
const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
  io: new Raspi()
});

// pull motor configs from ADAFRUIT_V2 template
const configs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;

// instantiate motors and LEDs when board is ready
var m1;
var m2;
var backLed;
var leftLed;
var rightLed;

board.on('ready', function() {
  m1 = new five.Motor(configs.M1);
  m2 = new five.Motor(configs.M2);

  backLed = new five.Led('GPIO21');
  leftLed = new five.Led('GPIO17');
  rightLed = new five.Led('GPIO4');

  // initial state of LEDs should be 'on'
  backLed.on();
  leftLed.on();
  rightLed.on();
});

const SPEED = 160;
const TURN_SPEED = 160;
const SPEED_MOD = 1.03;
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

//calculate angle of joystick
function calcAngle(dx, dy) {
  var absdx = Math.abs(dx);
  var absdy = Math.abs(dy);
  if (dx >= 0 && dy <= 0) {
    return 90 - Math.atan2(absdy, absdx)*360/(2*Math.PI);
  }
  else if (dx >= 0 && dy >= 0) {
    return 90 + Math.atan2(absdy, absdx)*360/(2*Math.PI);
  }
  else if (dx <= 0 && dy >= 0) {
    return 270 - Math.atan2(absdy, absdx)*360/(2*Math.PI);
  }
  else if (dx <= 0 && dy <= 0) {
    return 270 + Math.atan2(absdy, absdx)*360/(2*Math.PI);
  }
}

function flashLightAngle(angle) {
  //forward
  if (angle >= 350 || angle <= 10) {
    stopLight();
  }
  //backward
  else if (angle >= 170 && angle <= 190) {
    backLight();
  }
  //left
  else if (angle > 190 && angle < 350) {
    leftLight();
  }
  //right
  else if (angle < 170 && angle > 10) {
    rightLight();
  }
}

function customSpeed(dx, dy) {
  var angle = calcAngle(dx, dy);
  flashLightAngle(angle);
  var turnReduction = 0.75;
  var m1speed = dy + Math.floor(dx*turnReduction);
  var m2speed = dy - Math.floor(dx*turnReduction);

  if (m1speed < 0)
  m1.fwd(Math.abs(m1speed));
  else m1.rev(m1speed);

  if (m2speed < 0)
  m2.fwd(Math.abs(m2speed));
  else m2.rev(m2speed);
}

// SPEED_MOD compensates for tendency to drift to one side over time
function forward (speed) {
  m1.fwd(speed);
  m2.fwd(speed * SPEED_MOD);

  // if lights are blinking, stop them and set them to 'on'
  stopLight();
}

function reverse (speed) {
  m1.rev(speed);
  m2.rev(speed * SPEED_MOD);
  backLight();
}

function left (speed) {
  m1.fwd(speed);
  m2.rev(speed * SPEED_MOD);
  leftLight();
}

function right (speed) {
  m1.rev(speed);
  m2.fwd(speed * SPEED_MOD);
  rightLight();
}

function stop() {
  m1.stop();
  m2.stop();
  stopLight()
}

function backLight() {
  backLed.blink(150);
  leftLed.stop().on();
  rightLed.stop().on();
}

function leftLight() {
  backLed.stop().on();
  leftLed.blink(150);
  rightLed.stop().on();
}

function rightLight() {
  backLed.stop().on();
  leftLed.stop().on();
  rightLed.blink(150)
}

//stop light
function stopLight() {
  backLed.stop().on();
  leftLed.stop().on();
  rightLed.stop().on();
}

module.exports = { runCommand: runCommand };
