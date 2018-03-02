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
        if (users[k].nick === nick) {
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

// io is for everyone
// socket is for specific one
io.on('connection', function(socket) {

    // init connection
    users[socket.id] = { nick: generateNickname() };
    socket.emit('updateNickHeader', users[socket.id].nick);
    io.emit('updateUserlist', users);

    socket.on('chat', function(msg) {

        let fullmsg;
        let time = timestamp();

        // command handler
        if (msg.charAt(0) === '/') {
            let cmd = msg.substring(1).split(' ');
            if (cmd.length != 2) {
                socket.emit('flashStatusMessage', 'Invalid command. Try again.');
                return;
            }
            else {
                if (cmd[0] === 'nick') {
                    if (isNicknameUnique(cmd[1])) {
                        let oldnick = users[socket.id].nick;
                        users[socket.id].nick = cmd[1];
                        socket.emit('updateNickHeader', users[socket.id].nick);
                        io.emit('updateUserlist', users);
                        fullmsg = '(' + time + ') ' + ': ' + oldnick + ' changed nickname to ' + users[socket.id].nick;
                    }
                    else if (users[socket.id].nick === cmd[1]) {
                        socket.emit('flashStatusMessage', 'It is your current nickname. Please choose another one.');
                        return;
                    }
                    else {
                        socket.emit('flashStatusMessage', 'Nickname already exists. Try again.');
                        return;
                    }
                }
                else {
                    socket.emit('flashStatusMessage', 'Invalid command. Try again.');
                    return;
                }
            }
        }
        else {
            fullmsg = '(' + time + ') ' + users[socket.id].nick + ': ' + msg;

            chatlog.push({
                message: msg,
                timestamp: time,
                nick: users[socket.id].nick,
                nickcolor: '000000'
            });
            if (chatlog.length > MAX_MSG_COUNT)
                chatlog.shift();
        }

        io.emit('chat', fullmsg);
    });

    socket.on('disconnect', function() {
        delete users[socket.id];
        io.emit('updateUserlist', users);
        // write nick on cookie
    });
});