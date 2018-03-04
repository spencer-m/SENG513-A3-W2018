
/**
 * Parse cookie into object and get value of key.
 * @param {String} key 
 */
function getCookieValue(key) {

    let cookies = document.cookie.split('; ');
    let cookieObj = {};
    for (let c of cookies) {
        let keyval = c.split('=', 2);
        cookieObj[keyval[0]] = keyval[1];
    }
    return cookieObj[key];
}

function loadChatlog(chatlog) {

    $('#messages').empty();
    let clientNick = getCookieValue('nick');
    for (let c of chatlog) {

        // default error message
        let msgfmt = '<b><i>(' + c.timestamp + ') Fatal Error: Invalid Message Type!</i></b>';

        if (c.type === 'chatmsg') {
            let message = c.message;
            if (c.nick === clientNick)
                message = '<b>' + c.message + '</b>';
            // color nickname here
            let nickcolored = '<span style="color: ' + c.nickcolor + '">'+ c.nick + '</span>';
            msgfmt = '(' + c.timestamp + ') ' + nickcolored + ': ' +  message;
        }
        else if (c.type === 'actionmsg') {
            continue;
        }

        $('#messages').append($('<div class="list-group-item">').html(msgfmt));
    }
}

$(document).ready(function() {

    var socket = io();

    $('#inputbox').focus();

    // from server

    socket.on('chat', function(msgobj) {

        let clientCurrNick = $('#nickHeader').text().split('You are ')[1];
        if  (msgobj.nick === clientCurrNick)
            msgobj.message = '<b>' + msgobj.message + '</b>';

        if (msgobj.style === 'regular') {
            let msgfmt = '(' + msgobj.timestamp + ') ' + msgobj.nickcolored + ': ' +  msgobj.message;
            $('#messages').append($('<div class="list-group-item">').html(msgfmt));
        }
        else if (msgobj.style === 'italic') {
            let msgfmt = '<i> (' + msgobj.timestamp + ')' + ': ' +  msgobj.message + '</i>';
            $('#messages').append($('<div class="list-group-item">').html(msgfmt));
        }

        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    socket.on('chatRefresh', function(chatlog) {
        loadChatlog(chatlog);
    });

    socket.on('updateNickHeader', function(nick) {
        $('#nickHeader').text('You are ' + nick);
    });

    socket.on('updateUserlist', function(users) {
        // clear current list
        $('#userlist').empty();
        for (let s in users) {
            let nick = users[s].nick;
            let li = '<li class="list-group-item" id="' + nick + '">' + nick + '</li>';
            $('#userlist').append(li);
        }
    });

    socket.on('flashStatusMessage', function(statmsg, dTime) {
        $('#statusmessage').text(statmsg).fadeIn(1).delay(dTime).fadeOut();
    });

    socket.on('saveCookie', function(data) {
        document.cookie = data;
    });

    // page commands
    $('form').submit(function() {
        socket.emit('chat', $('#inputbox').val());
        $('#inputbox').val('');
        return false;
    });
});