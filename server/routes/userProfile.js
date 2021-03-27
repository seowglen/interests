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

        if (user_id_from_profile.rows[0].user_id === payload.user) {
            profile.rows[0]['ownself'] = true;
        } else {
            profile.rows[0]['ownself'] = false;
        }

        const group_id = await pool.query("SELECT group_id FROM user_group WHERE user_id IN (SELECT user_id FROM users WHERE profile_id = $1)", [
            req.body.id
        ]);

        var group_ids = [];
        for (var i=0; i<group_id.rows.length; i++) {
            group_ids.push(group_id.rows[i].group_id);
        }
        profile.rows[0]['group_ids'] = group_ids;

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

router.post('/reject', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const user_id_from_profile = await pool.query("SELECT user_id FROM users WHERE profile_id = $1", [
            req.body.id
        ]);

        await pool.query("DELETE FROM friends WHERE user_id = ($1) AND friend_id = ($2)", [
            payload.user,
            user_id_from_profile.rows[0].user_id
        ]);

        await pool.query("DELETE FROM friends WHERE user_id = ($1) AND friend_id = ($2)", [
            user_id_from_profile.rows[0].user_id,
            payload.user            
        ]);

        res.status(200).json("Rejected Friend Request");

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

        await pool.query("DELETE FROM friends WHERE user_id = ($1) AND friend_id = ($2)", [
            payload.user,
            user_id_from_profile.rows[0].user_id
        ]);

        await pool.query("DELETE FROM friends WHERE user_id = ($1) AND friend_id = ($2)", [
            user_id_from_profile.rows[0].user_id,
            payload.user            
        ]);

        await pool.query("INSERT INTO friends (user_id, friend_id, request) VALUES ($1, $2, $3)", [
            payload.user,
            user_id_from_profile.rows[0].user_id,
            "accepted"
        ]);

        await pool.query("INSERT INTO friends (user_id, friend_id, request) VALUES ($1, $2, $3)", [
            user_id_from_profile.rows[0].user_id,
            payload.user,
            "accepted"            
        ]);

        res.status(200).json("Sent Friend Request");

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/send', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const user_id_from_profile = await pool.query("SELECT user_id FROM users WHERE profile_id = $1", [
            req.body.id
        ]);

        await pool.query("INSERT INTO friends (user_id, friend_id, request) VALUES ($1, $2, $3)", [
            payload.user,
            user_id_from_profile.rows[0].user_id,
            "sender"
        ]);

        await pool.query("INSERT INTO friends (user_id, friend_id, request) VALUES ($1, $2, $3)", [
            user_id_from_profile.rows[0].user_id,
            payload.user,
            "receiver"            
        ]);

        res.status(200).json("Sent Friend Request");

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/remove', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const user_id_from_profile = await pool.query("SELECT user_id FROM users WHERE profile_id = $1", [
            req.body.id
        ]);

        await pool.query("DELETE FROM friends WHERE user_id = ($1) AND friend_id = ($2)", [
            payload.user,
            user_id_from_profile.rows[0].user_id
        ]);

        await pool.query("DELETE FROM friends WHERE user_id = ($1) AND friend_id = ($2)", [
            user_id_from_profile.rows[0].user_id,
            payload.user            
        ]);

        res.status(200).json("Rejected Friend Request");

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;