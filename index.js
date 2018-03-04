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
const SHORT_DELAY = 2000;
const LONG_DELAY = 4000;
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

function execCommand(msgobj, socket) {

    let cmd = msgobj.message;
    cmd = cmd.substring(1).split(' ');
    if (cmd.length != 2)
        socket.emit('flashStatusMessage', 'Invalid command. Try again.', SHORT_DELAY);
    else {
        if (cmd[0] === 'nick')
            msgobj = changeNick(cmd[1], msgobj, socket);
        else if (cmd[0] === 'nickcolor')
            msgobj = changeNickColor(cmd[1], msgobj, socket);
        else 
            socket.emit('flashStatusMessage', 'Invalid command. Try again.', SHORT_DELAY);
    }
    return msgobj;
}

function changeNick(newNick, msgobj, socket) {

    if (isNicknameUnique(newNick)) {
        let oldNick = users[socket.id].nick;
        users[socket.id].nick = newNick;
        updateChatlogNick(oldNick, newNick);
        nickSequence(socket);
        msgobj.message = oldNick + ' changed nickname to ' + users[socket.id].nick;
        msgobj.type = 'actionmsg';
    }
    else if (users[socket.id].nick === newNick)
        socket.emit('flashStatusMessage', 'That is your current nickname. Please choose another one.', LONG_DELAY);
    else
        socket.emit('flashStatusMessage', 'Nickname already exists. Try again.', LONG_DELAY);

    return msgobj;
}

function updateChatlogNick(oldNick, newNick) {

    for (let c of chatlog) {
        if ((c.type === 'chatmsg') && (c.nick === oldNick))
            c.nick = newNick;
    }
    io.emit('chatRefresh', chatlog);
}

function isValidHex(hex) {
    
    if (hex.toLowerCase().match(/^[a-f0-9]{6}$/) === null)
        return false;
    return true;
}

function changeNickColor(newNickColor, msgobj, socket) {

    if (users[socket.id].nickcolor === newNickColor)
        socket.emit('flashStatusMessage', 'That is your current nickname color. Please choose another one.', LONG_DELAY);
    else if (newNickColor.toLowerCase().match(/^[a-f0-9]{6}$/) !== null) {
        let oldNickColor = users[socket.id].nickcolor;
        users[socket.id].nickcolor = newNickColor;
        updateChatlogNickColor(users[socket.id].nick, newNickColor);
        nickSequence(socket);
        msgobj.message = users[socket.id].nick + ' changed nickname color ' + oldNickColor + ' to ' + newNickColor;
        msgobj.type = 'actionmsg';
    }
    else
        socket.emit('flashStatusMessage', 'Invalid nickname color. Try again.', LONG_DELAY);

    return msgobj;
}

function updateChatlogNickColor(nick, nickcolor) {

    for (let c of chatlog) {
        if ((c.type === 'chatmsg') && (c.nick === nick))
            c.nickcolor = nickcolor;
    }
    io.emit('chatRefresh', chatlog);
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

    /* TODO
        problem: new tab makes a new username
    */
    // when user is brand new
    if (socket.request.cookies.nick === undefined)
        users[socket.id] = { nick: generateNickname(), nickcolor: '000000' };
    // when user is returning user
    else {
        if (isNicknameUnique(socket.request.cookies.nick))
            users[socket.id] = { nick: socket.request.cookies.nick, nickcolor: '000000' };
        else {
            socket.emit('flashStatusMessage', 'Sorry, nickname has been taken. Assigning to a different nickname.', LONG_DELAY);
            users[socket.id] = { nick: generateNickname(), nickcolor: '000000' };
        }
    }

    // new user in chat
    socket.emit('chatRefresh', chatlog);
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
        if (msg.charAt(0) === '/') {
            msgobj = execCommand(msgobj, socket);
            if (msgobj.type !== 'actionmsg') {
                return; // exit function if execCommand fails
            }
        }

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