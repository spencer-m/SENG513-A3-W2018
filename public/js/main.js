$(document).ready(function() {

    var socket = io();

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

    $('form').submit(function() {
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });

    /*
    $('#m').keypress(function(event) {
        if (event.keyCode === 13) {
            $('#send').click();
        }
        return false;
    });

    $('#send').click(function() {
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });
    */
});