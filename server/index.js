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

app.listen(5000,  () => {
    console.log("Server has started on port 5000");
});