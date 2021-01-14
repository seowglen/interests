const router = require("express").Router();
const { Router } = require("express");
const pool = require('../db');
const authorization = require("../middleware/authorization");
const multer  = require('multer');
const upload = multer({ dest: './photos/' })
const fs = require('fs')
const jwtGenerator = require('../utils/jwtGenerator');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');

router.post('/get-details', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile = await pool.query("SELECT * FROM profile WHERE profile_id = $1", [
            req.body.id
        ]);
        res.json(profile.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-photo', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_picture = await pool.query("SELECT profile_picture FROM profile WHERE profile_id = $1", [
            req.body.id
        ]);

        const path_name = '.' + profile_picture.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;