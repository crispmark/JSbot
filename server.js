// initialize express app and middleware
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// initialize http server using express app, start listening on port
const http = require('http').Server(app);
const port = 3000;
http.listen(port, function(){
  console.log('listening on *:', port);
});

// initialize socket and start listening for messages
const io = require('socket.io')(http);



// import python dispatcher and runCommand(), along with command definitions
const robo    = require('./robo');
const command = require('./robo-commands');

io.on('connection', function(socket) {
  console.log('a user connected (id:', socket.id, ')');

  //listen for commands to robot
  socket.on(command.COMMAND, function(msg) {
    console.log('running command:', msg);
    robo.runCommand(msg); // msg contains the specific command to run
  });

  socket.on('disconnect', function(){
    console.log('a user disconnected (id:', socket.id, ')');
    robo.runCommand(command.STOP);
  });
});
/////////////////////////////////////////////////////////////////////////////
var camera = require('./camera.js');
var STREAM_SECRET = require('secure-random').randomArray(40).map(code => code.toString(16)).join('')

var STREAM_PORT = 8082,
	WEBSOCKET_PORT = 8084,
	STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

var width = 1280,
	height = 720;

var socketServer = new(require('ws').Server)({
	port: WEBSOCKET_PORT
});

socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);
	socket.send(streamHeader, {
		binary: true
	});

	console.log('New WebSocket Connection (' + socketServer.clients.length + ' total)');

	socket.on('close', function(code, message) {
		console.log('Disconnected WebSocket (' + socketServer.clients.length + ' total)');
	});
});

socketServer.broadcast = function(data, opts) {
	for (var i in this.clients) {
		if (this.clients[i].readyState == 1) {
			this.clients[i].send(data, opts);
		}
		else {
			console.log('Error: Client (' + i + ') not connected.');
		}
	}
};


// HTTP Server to accept incomming MPEG Stream
var streamServer = require('http').createServer(function(request, response) {
	var params = request.url.substr(1).split('/');

		if (params[0] == STREAM_SECRET) {

			console.log(
				'Stream Connected: ' + request.socket.remoteAddress +
				':' + request.socket.remotePort + ' size: ' + width + 'x' + height
			);
			request.on('data', function(data) {
				socketServer.broadcast(data, {
					binary: true
				});
			});
		}
		else {
			console.log(
				'Failed Stream Connection: ' + request.socket.remoteAddress +
				request.socket.remotePort + ' - wrong secret.'
			);
			response.end();
		}
}).listen(STREAM_PORT);
camera.start(STREAM_PORT, STREAM_SECRET);
