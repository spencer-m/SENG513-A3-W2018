/**
 * SENG 513 Assignment 3
 * Spencer Manzon
 * 10129731
 */

// variables
let MAX_MSG_COUNT = 20;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
let chatlog = [];
let users = {};

// helper functions

/**
 * Returns the current time with the format MMM DD HH:MM::SS
 */
function timestamp() {
    let ts;
    let now = new Date();
    let date = now.toDateString().split(' ').splice(1).join(' ');
    let time = now.toTimeString().split(' ')[0];
    ts =  date + ' ' + time;
    return ts;
}

/**
 * Generates a unique nickname from the user list
 * @param {list} ulist 
 */
function generateNickname() {

    let nick;

    // keep generating nickname until unique
    while (true) {
        
        nick = 'User';
        for (let i = 0; i < 6; i++)
            nick += Math.floor(Math.random() * 10);
        
        if (isNicknameUnique(nick))
            break;
    }
    
    return nick;
}

/**
 * Verifies if a nickname is not same with another user
 * @param {String} nick 
 */
function isNicknameUnique(nick) {

    let isUnique = true;
    for (let k in users) {
        if (users[k].nick == nick) {
            isUnique = false;
            break;
        }
    }

    return isUnique;
}

// server core

http.listen( port, function () {
    console.log('*-----------------------------------*');
    console.log('| server is ready.');
    console.log('| started at ' + timestamp());
    console.log('| listening on port ' + port);
    console.log('*-----------------------------------*');
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {

    // init connection
    socket.nick = generateNickname();
    users[socket.id] = socket;

    socket.on('chat', function(msg) {

        let time = timestamp()
        let fullmsg = '(' + time + ') ' + socket.nick + ': ' + msg;

        io.emit('chat', fullmsg);
        chatlog.push({
            message: msg,
            timestamp: time,
            nick: socket.nick,
            nickcolor: '000000'
        });
        if (chatlog.length > MAX_MSG_COUNT)
            chatlog.shift();
    });

    socket.on('disconnect', function() {
        delete users[socket.id];
        // write nick on cookie
    });
});