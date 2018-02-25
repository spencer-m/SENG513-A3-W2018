/**
 * SENG 513 Assignment 3
 * Spencer Manzon
 * 10129731
 */

// variables
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// helper functions

/**
 * Returns the current time with the format MMM DD
 */
function timestamp() {
    let ts;
    let now = new Date();
    let date = now.toDateString().split(' ').splice(1).join(' ');
    let time = now.toTimeString().split(' ')[0];
    ts =  date + ' ' + time;
    return ts;
}

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

let chatlog = [];
let users = [];

// listen to 'send' messages
io.on('connection', function(socket){

    socket.on('chat', function(msg){
        io.emit('chat', timestamp() + ': ' + msg);
    });

    
});