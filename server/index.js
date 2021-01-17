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

app.listen(5000,  () => {
    console.log("Server has started on port 5000");
});