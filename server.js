var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, {
        log: false
    });

server.listen(5000);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

var Game = {
    history: [],
    p1: null,
    p2: null,
    p1move: null,
    p2move: null
};

io.sockets.on('connection', function(socket) {

    //Game.players.push(socket);
    if (Game.p1 === null) {
        var r = randId();
        Game[r] = 'p1';
        Game.p1 = r;
        socket.set('id', r);
    } else if (Game.p2 === null) {
        var r = randId();
        Game[r] = 'p2';
        Game.p2 = r;
        socket.set('id', r);
    }

    socket.on('choice', function(data) {

        socket.get('id', function(err, pid) {
            //console.log(pid);

            Game[Game[pid] + 'move'] = data.move;
        	var m1 = Game.p1move,
            	m2 = Game.p2move;

            if (m1 !== null && m2 !== null) {

                if (m1 === m2) {
                    Game.history.push([m1, m2, 'draw']);
                } else if ((m1 === 'r' && m2 === 's') || (m1 === 's' && m2 === 'p')) {
                    Game.history.push([m1, m2, 'p1']);
                } else {
                    Game.history.push([m1, m2, 'p2']);
                }
                socket.broadcast.emit('history', {
                    arr: Game.history[Game.history.length - 1]
                });
                socket.emit('history', {
                    arr: Game.history[Game.history.length - 1]
                });

                //console.log('SENT HISTORY ' + Game.p1move + Game.p2move);

                Game.p1move = null;
                Game.p2move = null;

            } 
        });
    });

	socket.on('disconnect', function () {
		socket.get('id', function (err, pid) {
			Game[Game[pid]] = null;
		});
	});
});

function randId() {
    return (Math.random() * 10).toString(36).replace(/\.+/g, '');
}
