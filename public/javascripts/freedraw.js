$(document).ready(function () {

    // Capture the DOM elements
    var canvas = document.getElementById("canvas");

    var ctx = canvas.getContext("2d");
    var $canvas = $("#canvas");
    var strokeStyle = "black";
    var lineWidth = 10;
    var drawing;

    // Set the client-side connection
    var socket = io.connect('https://damp-caverns-81185.herokuapp.com/freedraw');

    // Listen for draw messages from server
    socket.on('draw', function (data) {
        console.log("User Drew Something...");
        draw(data);
    });

    // Begin draw
    $canvas.mousedown(function (event) {
        drawing = true;
        currentX = event.pageX - this.offsetLeft;
        currentY = event.pageY - this.offsetTop;

    });

    // End draw
    $canvas.mouseup(function (event) {
        drawing = false;
    });

    $canvas.mouseleave(function (event) {
        drawing = false
    });

    // Pick color and line width
    $(".color").on('click', function (event) {
        event.preventDefault();
        strokeStyle = $(this).css("background-color")
    });

    $(".line-width").on('click', function (event) {
        event.preventDefault();
        lineWidth = $(this).attr('id')
    });

    // Set x/y coordinates and send data to server
    $canvas.mousemove(function (event) {

        if (drawing) {
            prevX = currentX;
            prevY = currentY;
            currentX = event.pageX - this.offsetLeft;
            currentY = event.pageY - this.offsetTop;

            socket.emit('draw', {
                x: currentX,
                y: currentY,
                prevX: prevX,
                prevY: prevY,
                strokeStyle: strokeStyle,
                lineWidth: lineWidth,
                name: name
            });
            console.log("from emit");
        }

    });

    // Draw using the x/y coordinates
    function draw(data) {
        console.log(data.x);
        console.log(data.y);
        ctx.beginPath();
        ctx.strokeStyle = data.strokeStyle;
        ctx.lineJoin = "round";
        ctx.lineWidth = data.lineWidth;
        ctx.moveTo(data.prevX, data.prevY);
        ctx.lineTo(data.x, data.y);
        ctx.closePath();
        ctx.stroke();
    }

    // Set username
    var username;
    $('form.username').submit(function (event) {
        event.preventDefault();
        name = $('#name').val();
        $(this).hide();

        // Emit that user has joined
        var user = {name: name};
        socket.emit('userJoined', user);
    });

// Send chat messages
    $('form.send-chat').submit(function () {
        var message = {
            name: name,
            text: $('#message').val()
        };

        if (message.name != "") {
            console.log("Message Sent");
            console.log(message.name);

            socket.emit('chatMessage', message);
            $('#message').val('');
        } else {
            console.log("Must enter Username");

            $('#chatbox').append("<p>You must enter a username to chat</p>");

            var $cont = $('.chatbox');
            $cont[0].scrollTop = $cont[0].scrollHeight;
            $cont.append('<p>' + $(this).val() + '</p>');
            $cont[0].scrollTop = $cont[0].scrollHeight;
            $(this).val('');
        }

        return false;
    });

    // Update chatbox to show user has joined
    socket.on('userJoined', function (user, userlist) {
        $('#chatbox').append("<p>" + user.name + " has joined the chatroom</p>");

        var $cont = $('.chatbox');
        $cont[0].scrollTop = $cont[0].scrollHeight;
        $cont.append('<p>' + $(this).val() + '</p>');
        $cont[0].scrollTop = $cont[0].scrollHeight;
        $(this).val('');

        $('#userlist').html("");

        for (var i = 0; i < userlist.length; i++) {
            $('#userlist').append("<li>" + userlist[i] + "</li>");
        }

    });

    // Update chatbox to show user has left
    socket.on('userLeft', function (user, userlist) {
        $('#chatbox').append("<p>" + user + " has Disconnected</p>");

        var $cont = $('.chatbox');
        $cont[0].scrollTop = $cont[0].scrollHeight;
        $cont.append('<p>' + $(this).val() + '</p>');
        $cont[0].scrollTop = $cont[0].scrollHeight;
        $(this).val('');

        $('#userlist').html("");

        for (var i = 0; i < userlist.length; i++) {
            $('#userlist').append("<li>" + userlist[i] + "</li>");
        }

    });


    // Listen for chat messages
    socket.on('chatMessage', function (message) {

        var $cont = $('.chatbox');
        $cont[0].scrollTop = $cont[0].scrollHeight;
        $cont.append("<p>" + message.name + ": " + message.text + "</p>");
        $cont[0].scrollTop = $cont[0].scrollHeight;
        $(this).val('');
    });

    // Listen for UserCount change
    socket.on('userCount', function (count) {
        $('#usercount').html(count);
    });

    // Call on Browser Closure
    window.onbeforeunload = function() {
        socket.emit('userLeft', name);
    };

}); // end document ready