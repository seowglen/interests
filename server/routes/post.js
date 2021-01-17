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

router.post('/get-name', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_name = await pool.query(
            "SELECT profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM posts WHERE post_id = $1))", [
            req.body.id
        ]);

        res.json(profile_name.rows[0]);

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

        const profile_picture = await pool.query(
            "SELECT profile_picture FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM posts WHERE post_id = $1))", [
            req.body.id
        ]);

        const path_name = '.' + profile_picture.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-post', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const post = await pool.query(
            "SELECT time_stamp, post FROM posts WHERE post_id = $1", [
            req.body.id
        ]);

        const comment_ids = await pool.query(
            "SELECT comment_id, time_stamp FROM comments WHERE post_id = $1 ORDER BY time_stamp ASC", [
            req.body.id
        ]);

        const profile_id = await pool.query(
            "SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM posts WHERE post_id = $1)", [
            req.body.id
        ]);

        if (comment_ids.rows.length === 0) {
            post.rows[0]['comment_ids'] = []
        } else {
            var comments = [];
            for (var i=0; i<comment_ids.rows.length; i++) {
                comments.push(comment_ids.rows[i].comment_id)
            }
            post.rows[0]['comment_ids'] = comments;
        }
        post.rows[0]['profile_id'] = profile_id.rows[0].profile_id;
        res.json(post.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;