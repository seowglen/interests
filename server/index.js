const express = require("express");
const app = express();
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
});

// middleware

app.use(cors());
app.use(express.json());
const { addUser, removeUser, getUser, getUsersInRoom } = require('./online');

// routes

// register and login routes

app.use('/auth', require('./routes/auth'));

// home route

app.use('/home', require('./routes/home'));

// profile route

app.use('/profile', require('./routes/profile'));

// friends route

app.use('/friends', require('./routes/friends'));

// profile card route

app.use('/profileCard', require('./routes/profileCard'));

// user profile route

app.use('/userProfile', require('./routes/userProfile'));

// user post route

app.use('/post', require('./routes/post'));

// comment route

app.use('/comment', require('./routes/comment'));

// groups route

app.use('/groups', require('./routes/groups'));

// group card route

app.use('/groupCard', require('./routes/groupCard'));

// group profile route

app.use('/groupProfile', require('./routes/groupProfile'));

// chat route

app.use('/chat', require('./routes/chat'));

// SOCKET.IO

// const io = require('socket.io')(server,  {
//     cors: {
//       origin: "http://localhost:3000",
//       credentials: true
//     }
// });

io.on('connection', (socket) => {
    console.log('We have a new connection!!!');

    socket.on('join', (data) => {
        console.log(data);
        const { user } = addUser({ id: socket.id, name: data.name, room: data.room});

        socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the chat room (${user.room})!`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} has joined the chat room!`});
        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    });

    socket.on('sendMessage', (message) => {
        const user = getUser(socket.id);
        // console.log(message);
        io.to(user.room).emit('message', { user: user.name, text: message});
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    });

    socket.on('disconnected', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the chat room!`});
        }
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the chat room!`});
        }
    });
});

server.listen(5000,  () => {
    console.log("Server has started on port 5000");
});