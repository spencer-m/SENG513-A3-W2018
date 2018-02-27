$(document).ready(function() {

    var socket = io();

    socket.on('connect', function() {
        console.log('conencted to server');
    });

    socket.on('disconnect', function() {
        console.log('disconnected from server');
    });

    socket.on('chat', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });

    $('form').submit(function() {
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });
});