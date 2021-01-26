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

router.post('/get-photo', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_picture = await pool.query(
            "SELECT profile_picture FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM comments WHERE comment_id = $1))", [
            req.body.id
        ]);

        const path_name = '.' + profile_picture.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-comment', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const comment = await pool.query(
            "SELECT time_stamp, comment FROM comments WHERE comment_id = $1", [
            req.body.id
        ]);

        const profile = await pool.query(
            "SELECT profile_id, profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM comments WHERE comment_id = $1))", [
            req.body.id
        ]);

        comment.rows[0]['profile_id'] = profile.rows[0].profile_id;
        comment.rows[0]['profile_name'] = profile.rows[0].profile_name;
        res.json(comment.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/create-comment', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const comment_id = await pool.query(
            "INSERT INTO comments (post_id, user_id, time_stamp, comment) VALUES ($1, $2, to_timestamp($3), $4) RETURNING comment_id", [
            req.body.id,
            payload.user,
            (Date.now() / 1000.0),
            req.body.comment
        ]);
        
        const new_comment_id = comment_id.rows[0];
        res.json({ new_comment_id });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;