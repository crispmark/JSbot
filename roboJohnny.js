const command = require('./robo-commands.js');
const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
  io: new Raspi()
});
// pull motor configs from ADAFRUIT_V2 template
const configs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;
// instantiate motors
const m1 = new five.Motor(configs.M1);
const m2 = new five.Motor(configs.M2);

const SPEED = 128;
const TURN_SPEED = 64;

function runCommand (val) {
  switch(val) {
    case command.FORWARD:
      forward(SPEED);
      break;
    case command.REVERSE:
      reverse(SPEED);
      break;
    case command.TURN_LEFT:
      left(TURN_SPEED);
      break;
    case command.TURN_RIGHT:
      right(TURN_SPEED);
      break;
    case command.STOP:
      stop();
      break;
  }
}

function forward (speed) {
  m1.fwd(speed);
  m2.fwd(speed);
}

function reverse (speed) {
  m1.rev(speed);
  m2.rev(speed);
}

function left (speed) {
  m1.rev(speed);
  m2.fwd(speed);
}

function right (speed) {
  m1.fwd(speed);
  m2.rev(speed);
}

function stop() {
  m1.stop();
  m2.stop();
}

module.exports = { board: board, runCommand: runCommand };
// var STEPS = 10;
// var TIMESTEP = 100;
//
// function forward(finalSpeed) {
//   var speed = 0;
//
//   var interval = setInterval(function() {
//     if (speed > finalSpeed) {
//       clearInterval(interval);
//       return;
//     }
//
//     speed += finalSpeed / STEPS;
//     m1.forward(speed);
//     m2.forward(speed);
//   }, TIMESTEP);
// }
