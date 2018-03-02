$(document).ready(function() {

    var socket = io();

    // from server
    socket.on('connect', function() {
        console.log('conencted to server');
    });

    socket.on('disconnect', function() {
        console.log('disconnected from server');
    });

    socket.on('chat', function(msg) {
        $('#messages').append($('<div class="list-group-item">').text(msg));
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
        $('#statusmessage').text(statmsg).fadeIn(1).delay(1000).fadeOut();
    });

    // page commands
    $('form').submit(function() {
        socket.emit('chat', $('#inputbox').val());
        $('#inputbox').val('');
        return false;
    });
});