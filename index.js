const http = require('http');
const express = require('express');
const { Server: SocketIO } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new SocketIO(server);
const PORT = process.env.PORT || 8000;

const users = new Map();

io.on('connection', (socket) => {
    console.log(`user connected: ${socket.id}`);
   
    socket.emit("hello",socket.id);
    
    users.set(socket.id, socket.id);

    // emit that a new user has joined as soon as someone joins
    socket.emit('user:joined', socket.id);

    socket.on('outgoing:call', data => {
        const { fromOffer, to } = data;
        
        socket.to(to).emit('incomming:call', { from: socket.id, offer: fromOffer });
    });

    socket.on('call:accepted', data => {
        console.log("accepted");
        const { answere, to } = data;
        console.log(to);
        socket.to(to).emit('incomming:call', { from: socket.id, offer: answere })
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
    });
});

app.get('/users', (req, res) => {
    return res.json(Array.from(users));
});

app.use(express.static( path.resolve('./public') ));

server.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
