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

router.get('/get-details', authorization, async (req, res) => {
    try {
        const profile_id = await pool.query("SELECT (profile_id) FROM users WHERE user_id = $1", [
            req.user
        ])

        const profile = await pool.query("SELECT * FROM profile WHERE profile_id = $1", [
            profile_id.rows[0].profile_id
        ])
        res.json(profile.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.get('/get-photo', authorization, async (req, res) => {
    try {

        const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
            req.user
        ]);

        const profile = await pool.query("SELECT profile_picture FROM profile WHERE profile_id = $1", [
            user.rows[0].profile_id
        ]);

        const path_name = '.' + profile.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.get('/get-ids', authorization, async (req, res) => {
    try {
        const forum_post_ids = []
        const forum_posts = await pool.query("SELECT (forum_post_id) FROM forum_posts ORDER BY time_stamp DESC");
        for (var i = 0; i < forum_posts.rows.length; i++) {
            forum_post_ids.push(forum_posts.rows[i].forum_post_id);
        }
        res.json({ forum_post_ids });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/create-post', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const post_id = await pool.query(
            "INSERT INTO forum_posts (user_id, time_stamp, forum_title, forum_post, view_count) VALUES ($1, to_timestamp($2), $3, $4, $5) RETURNING forum_post_id", [
            payload.user,
            (Date.now() / 1000.0),
            req.body.title,
            req.body.post,
            0
        ]);

        const new_post_id = post_id.rows[0];
        res.json({ new_post_id });

    } catch (error) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-forum-photo', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_picture = await pool.query(
            "SELECT profile_picture FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM forum_posts WHERE forum_post_id = $1))", [
            req.body.id
        ]);

        const path_name = '.' + profile_picture.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-forum-details', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const post = await pool.query(
            "SELECT time_stamp, view_count, forum_title FROM forum_posts WHERE forum_post_id = $1", [
            req.body.id
        ]);

        const profile = await pool.query(
            "SELECT profile_id, profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM forum_posts WHERE forum_post_id = $1))", [
            req.body.id
        ]);

        const comments = await pool.query("SELECT * FROM forum_comments WHERE forum_post_id = $1",[
            req.body.id    
        ]);

        if (comments === null) {
            post.rows[0]['comment_count'] = 0;
        } else {
            post.rows[0]['comment_count'] = comments.rows.length;
        }
        post.rows[0]['profile_id'] = profile.rows[0].profile_id;
        post.rows[0]['profile_name'] = profile.rows[0].profile_name;
        res.json(post.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-post-details', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const post = await pool.query(
            "SELECT time_stamp, view_count, forum_title, forum_post FROM forum_posts WHERE forum_post_id = $1", [
            req.body.id
        ]);

        var updated_view_count = post.rows[0]['view_count'] + 1;

        await pool.query("UPDATE forum_posts SET view_count = $1 WHERE forum_post_id = $2", [
            updated_view_count,
            req.body.id
        ])

        const profile = await pool.query(
            "SELECT profile_id, profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM forum_posts WHERE forum_post_id = $1))", [
            req.body.id
        ]);

        const comments = await pool.query("SELECT * FROM forum_comments WHERE forum_post_id = $1 ORDER BY time_stamp ASC",[
            req.body.id    
        ]);

        if (comments === null) {
            post.rows[0]['comment_count'] = [];
        } else {
            const comment_ids = []
            for (var i = 0; i < comments.rows.length; i++) {
                comment_ids.push(comments.rows[i]);
            }
            post.rows[0]['comment_ids'] = comment_ids;
        }
        post.rows[0]['profile_id'] = profile.rows[0].profile_id;
        post.rows[0]['profile_name'] = profile.rows[0].profile_name;
        res.json(post.rows[0]);

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
            "INSERT INTO forum_comments (user_id, time_stamp, forum_post_id, forum_comment) VALUES ($1, to_timestamp($2), $3, $4) RETURNING *", [
            payload.user,
            (Date.now() / 1000.0),
            req.body.id,
            req.body.comment,
        ]);

        const new_comment_id = comment_id.rows[0];
        res.json({ new_comment_id });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-name-user', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_name = await pool.query(
            "SELECT profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id = ($1))", [
            req.body.id
        ]);

        res.json(profile_name.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-comment-photo', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_picture = await pool.query(
            "SELECT profile_picture FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id = ($1))", [
            req.body.id
        ]);

        const path_name = '.' + profile_picture.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/create-reply', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const comment_id = await pool.query(
            "INSERT INTO forum_comments (user_id, time_stamp, forum_post_id, forum_comment, parent_comment_id) VALUES ($1, to_timestamp($2), $3, $4, $5) RETURNING *", [
            payload.user,
            (Date.now() / 1000.0),
            req.body.post_id,
            req.body.reply,
            req.body.comment_id
        ]);

        const new_comment_id = comment_id.rows[0];
        res.json({ new_comment_id });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;