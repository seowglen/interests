const express = require("express");
const app = express();
const cors = require('cors');

// middleware

app.use(cors());
app.use(express.json());

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

const server = app.listen(5000,  () => {
    console.log("Server has started on port 5000");
});

const io = require('socket.io')(server,  {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('We have a new connection!!!');

    socket.on('join', (data) => {
        console.log(data);
    })

    socket.on('disconnected', () => {
        console.log('User had left!!!');
    });
});
