/**
 * SENG 513 Assignment 3
 * Spencer Manzon
 * 10129731
 * 
 * Known Flaws:
 *  Someone can take another user's nickname and change the ownership of the messages
 */

// variables
const MAX_MSG_COUNT = 5;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cookieParser = require('socket.io-cookie-parser');
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

/**
 * Creates cookie data for the client to save
 * @param {String} nick 
 */
function createCookieData(nick) {
    
    // make expiry date
    let currDate = new Date();
    let day = 1; // one day
    currDate.setTime(currDate.getTime() + (day*24*60*60*1000));
    let expiry = 'expires=' + currDate.toUTCString() + ';';
    // key and value
    let keyval = 'nick=' + nick + ';';
    return keyval + expiry + 'path=/';
}

/**
 * Nickname sequence when nickname is changed or a new user is present.
 * Tells the client to:
 *  - Update the nickname header text with given nickname
 *  - Save the cookie with given data
 *  - Tell everyone to update the userlist
 * @param {socket} socket 
 */
function nickSequence(socket) {
    socket.emit('updateNickHeader', users[socket.id].nick);
    socket.emit('saveCookie', createCookieData(users[socket.id].nick));
    io.emit('updateUserlist', users);
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
io.use(cookieParser());
io.on('connection', function(socket) {

    // init connection
    // when user is brand new
    if (socket.request.cookies.nick === undefined)
        users[socket.id] = { nick: generateNickname(), nickcolor: '#000000' };
    // when user is returning user
    else {
        if (isNicknameUnique(socket.request.cookies.nick))
            users[socket.id] = { nick: socket.request.cookies.nick, nickcolor: '#000000' };
        else {
            socket.emit('flashStatusMessage', 'Sorry, nickname has been taken. Assigning to a different nickname.', 3000);
            users[socket.id] = { nick: generateNickname(), nickcolor: '#000000' };
        }
    }

    // new user in chat
    nickSequence(socket);

    socket.on('chat', function(msg) {

        // set defaults
        let time = timestamp();
        let msgobj = {
            type: 'chatmsg',
            message: msg,
            timestamp: time,
            nick: users[socket.id].nick,
            nickcolor: users[socket.id].nickcolor,
        };

        // command handler
        /*
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
                        nickSequence(socket);
                        msgobj.message = oldnick + ' changed nickname to ' + users[socket.id].nick;
                        msgobj.style = 'italic';
                    }
                    else if (users[socket.id].nick === cmd[1]) {
                        socket.emit('flashStatusMessage', 'That is your current nickname. Please choose another one.', 2000);
                        return;
                    }
                    else {
                        socket.emit('flashStatusMessage', 'Nickname already exists. Try again.', 2000);
                        return;
                    }
                }
                else {
                    socket.emit('flashStatusMessage', 'Invalid command. Try again.', 1600);
                    return;
                }
            }
        }
        */

        chatlog.push(msgobj);
        if (chatlog.length > MAX_MSG_COUNT)
            chatlog.shift();
        io.emit('chatRefresh', chatlog);
    });

    socket.on('disconnect', function() {
        delete users[socket.id];
        io.emit('updateUserlist', users);
    });
});