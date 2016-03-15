var jsmpeg = require('jsmpeg');
var url = location.hostname;
var protocol = location.protocol;
var wsprotocol;
if (protocol === 'http:')
wsprotocol = 'ws:';
if (protocol === 'https:')
wsprotocol = 'wss:';

var client = new WebSocket( `${wsprotocol}//${url}:8084/` );

var canvas = document.getElementById('videoCanvas');
var player = new jsmpeg(client, {
    canvas: canvas
});
