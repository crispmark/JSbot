var PythonShell = require('python-shell');

function runMotor(motor, speed) {
  var pyshell = new PythonShell('./motorControl.py');
  // sends a message to the Python script via stdin
  pyshell.send(JSON.stringify({motor: motor, speed: speed}));

  // end the input stream and allow the process to exit
  pyshell.end(function (err) {
    if (err) throw err;
  });
}

module.exports = {
  runMotor: runMotor
}
