$(document).ready(function() {

    var socket = io();

    // from server
    socket.on('connect', function() {
        console.log('conencted to server');
    });

    socket.on('disconnect', function() {
        console.log('disconnected from server');
    });

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

    socket.on('flashStatusMessage', function(statmsg) {
        $('#statusmessage').text(statmsg).fadeIn(1).delay(1600).fadeOut();
    });

    // page commands
    $('form').submit(function() {
        socket.emit('chat', $('#inputbox').val());
        $('#inputbox').val('');
        return false;
    });
});