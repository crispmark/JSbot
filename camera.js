var ip = 'http://localhost';
var exec = require('child_process').exec;

function execute(port, secret) {
  var command = `ffmpeg -loglevel panic -s 640x480 -f video4linux2 -i /dev/video0 \
  -vf "transpose=2,transpose=2" -f mpeg1video -b:v 800k -r 30 \
  http://localhost:${port}/${secret}`;

  exec(command,
      function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
               console.log('exec error: ' + error);
               execute(port, secret);
          }
      });
}

module.exports = {
  start: execute
};
