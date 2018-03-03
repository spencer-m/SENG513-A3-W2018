function updateCookie(nick) {
    // make expiry date
    let currDate = new Date();
    let day = 1; // one day
    currDate.setTime(currDate.getTime() + (day*24*60*60*1000));
    let expiry = 'expires=' + currDate.toUTCString() + ';';
    // key and value
    let keyval = 'nick=' + nick + ';';
    document.cookie = keyval + expiry + 'path=/';
}

$(document).ready(function() {

    var socket = io();

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