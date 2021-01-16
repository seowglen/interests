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

        const user_id_from_profile = await pool.query("SELECT user_id FROM users WHERE profile_id = $1", [
            req.body.id
        ]);

        try {
            var friend_request = await pool.query("SELECT request FROM friends WHERE user_id = $1 AND friend_id = $2", [
                payload.user,
                user_id_from_profile.rows[0].user_id
            ]);

            friend_request = friend_request.rows[0].request

        } catch (err) {
            var friend_request = null;
        }

        profile.rows[0]['friend_request'] = friend_request;

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

router.post('/accept', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const user_id_from_profile = await pool.query("SELECT user_id FROM users WHERE profile_id = $1", [
            req.body.id
        ]);

        await pool.query("UPDATE friends SET request = ($1) WHERE user_id = ($2) AND friend_id = ($3)", [
            "accepted",
            payload.user,
            user_id_from_profile.rows[0].user_id
        ]);

        await pool.query("UPDATE friends SET request = ($1) WHERE user_id = ($2) AND friend_id = ($3)", [
            "accepted",
            user_id_from_profile.rows[0].user_id,
            payload.user            
        ]);

        res.status(200).json("Accepted Friend Request");

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;