import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import command from './robo-commands.js';

//establish connection to server
var socket = io.connect();
var ButtonInterface = require('./interface.js')(socket);

var VirtualJoystick = require('./joystick.js');


var MainPage = React.createClass({
  joystick: undefined,
  endTime: undefined,

  getInitialState: function() {
    return {
      controls: "dpad",
      timeLeft: 0,
      controlActive: false
    }
  },
  componentWillMount: function() {
    var component = this;
    setInterval(function(){
      if (component.endTime) {
        component.setState({
          timeLeft: Math.trunc( (component.endTime) / 1000 )
        });
      }
    }, 500);

    socket.on('timeUpdate', function(msg) {
      component.endTime = msg.time;
      component.setState( {controlActive: msg.control} );
    });
  },
  componentDidMount: function() {
    var select = document.querySelector("select");
    select.addEventListener("change", this.handleSelect);
    select.addEventListener("keydown", preventDefault);
  },
  componentWillUnmount: function() {
    var select = document.querySelector("select");
    select.removeEventListener("change", this.handleSelect);
    select.removeEventListener("keydown", preventDefault);
  },

  componentDidUpdate: function() {
    if(this.joystick) {
      if (this.state.controls === "dpad") {
        this.joystick.destroy();
        this.joystick = undefined;
      }
    }
    else if (this.state.controls === "joystick") {
      var jstick = addJoystick();
      this.joystick = jstick;
    }
  },

  handleSelect: function(e) {
    var controls = e.target.options[e.target.selectedIndex].value;
    console.log(controls)
    this.setState({controls: controls});
  },

  render: function() {
    var header = createHeader.call(this);
    var footer = createFooter();
    var controlPad = getControlPad(this.state.controls);
    return(
      <div className="belowHeader">
        {header}
        <div id="joystick">
          <div className="belowJoystick">
        <main>
          <canvas id="videoCanvas" width="640" height="480">
            <p>
              Please use a browser that supports the Canvas Element, like
              <a href="http://www.google.com/chrome">Chrome</a>,
              <a href="http://www.mozilla.com/firefox/">Firefox</a>,
              <a href="http://www.apple.com/safari/">Safari</a> or Internet Explorer 10
            </p>
          </canvas>
          {controlPad}
        </main>
        {footer}
      </div>
      </div>
      </div>
    );
  }
});

function preventDefault(e) {
  e.preventDefault();
}

function getControlPad(controls) {
  switch(controls) {
    case "dpad":
    return <ButtonInterface />
    default:
    return <div />
  }
}

//create the header for the webpage
function createHeader() {
  var timerClass = this.state.controlActive ? 'timerActive' : 'timerInactive';
  return (
    <div className="header">
      <p className="title">JSbot</p>
      <div>
        <h1 className={timerClass}> Time left: {this.state.timeLeft}s </h1>
      </div>
      <select onchange={this.handleSelect}>
        <option value="dpad">D-Pad</option>
        <option value="joystick">Joystick</option>
      </select>
    </div>
  )
}

//create the footer for the webpage
function createFooter() {
  return (
    <div className="footer">
        <p className="credits">Created by Philip Rajchgot and Mark Crisp</p>
        <p className="credits">for decodeMTL</p>
    </div>
  )
}


// adds buttons to DOM
ReactDOM.render(<MainPage />, document.getElementById('reactcontainer'));

function addJoystick() {
  var joystick	= new VirtualJoystick({
    container	: document.getElementById('joystick'),
    mouseSupport	: true,
  });
  joystick.addEventListener('touchEnd', function(){
    handleUp();
  })
  joystick.addEventListener('touchMove', function(){
    handleMove();
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
  return joystick;
}
