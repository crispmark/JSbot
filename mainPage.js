import React from 'react';
import ReactDOM from 'react-dom';
import ButtonInterface from './interface.js';

import io from 'socket.io-client';
import command from './robo-commands.js';

//establish connection to server
var socket = io.connect();

var VirtualJoystick = require('./joystick.js');

//creates the main page
function createPage() {
  var header = createHeader();
  var footer = createFooter();
  return (
    <div>
      {header}
      <main id="joystick">
        <canvas id="videoCanvas" width="640" height="480">
          <p>
            Please use a browser that supports the Canvas Element, like
            <a href="http://www.google.com/chrome">Chrome</a>,
            <a href="http://www.mozilla.com/firefox/">Firefox</a>,
            <a href="http://www.apple.com/safari/">Safari</a> or Internet Explorer 10
          </p>
        </canvas>
        <ButtonInterface />
        <div>

        </div>
      </main>
      {footer}
    </div>
  )
}

//create the header for the webpage
function createHeader() {
  return (
    <div className="header">
      <p className="title">JSbot</p>
    </div>
  )
}

//create the footer for the webpage
function createFooter() {
  return (
    <div className="footer">
        <p className="credits">Created by Philip Rajchot and Mark Crisp</p>
        <p className="credits">for decodeMTL</p>
    </div>
  )
}


// adds buttons to DOM
ReactDOM.render(createPage(), document.getElementById('reactcontainer'));


var joystick	= new VirtualJoystick({
  container	: document.getElementById('reactcontainer'),
  mouseSupport	: true,
});
joystick.addEventListener('touchStart', function(){
  console.log('down')
})
joystick.addEventListener('touchEnd', function(){
  handleUp();
})
joystick.addEventListener('touchMove', function(){
  handleMove();
})
joystick.addEventListener('mouseDown', function(){
  console.log('down')
})
joystick.addEventListener('mouseUp', function(){
  handleUp();
})
joystick.addEventListener('mouseMove', function(){
  handleMove();
})
var oldx = 0;
var oldy = 0;
function handleMove() {
  var dx = joystick.deltaX();
  var dy = joystick.deltaY();
  if (Math.abs(oldx - dx) > 10 || Math.abs(oldy - dy) > 10) {
    oldx = dx;
    oldy = dy;
    socket.emit(command.COMMAND, {time: Date.now(), command: command.CUSTOM, dx: dx, dy, dy});
    var txt = 'dx: ' + dx + ' dy: ' + dy;
    console.log(txt);
  }
}
function handleUp() {
  socket.emit(command.COMMAND, {time: Date.now(), command: command.STOP});
}
