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

        const user_id = await pool.query("SELECT user_id FROM comments WHERE comment_id = $1", [req.body.id]);

        if (user_id.rows[0].user_id === payload.user) {
            comment.rows[0]['user_comment'] = true;
        } else {
            comment.rows[0]['user_comment'] = false;
        }

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

        const user_id_from_post = await pool.query(
            "SELECT user_id, post FROM posts WHERE post_id = ($1)",
            [
                req.body.id
            ]
        )
        
        var notification;
        if (user_id_from_post.rows[0].post.length <= 30) {
            notification = "has commented on your post: " + user_id_from_post.rows[0].post;
        } else {
            notification = "has commented on your post: " + user_id_from_post.rows[0].post.slice(0, 30) + '...';
        }

        if (user_id_from_post.rows[0].user_id !== payload.user) {
            await pool.query(
                "INSERT INTO notifications (user_id, other_user_id, time_stamp, notification, seen) VALUES ($1, $2, to_timestamp($3), $4, $5)",
                [
                    user_id_from_post.rows[0].user_id,
                    payload.user,
                    (Date.now() / 1000.0),
                    notification,
                    false
                ]
            );
        }

        const user_comments = await pool.query(
            "SELECT DISTINCT user_id FROM comments WHERE post_id = ($1) AND user_id != ($2) AND user_id != ($3)",
            [
                req.body.id,
                user_id_from_post.rows[0].user_id,
                payload.user
            ]
        );

        if (user_comments !== undefined) {

            const profile_name_from_user_id = await pool.query(
                "SELECT profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id = ($1))",
                [
                    user_id_from_post.rows[0].user_id
                ]
            );

            var notification_to_others;
            if (user_id_from_post.rows[0].post.length <= 30) {
                notification_to_others = "has also commented on " + profile_name_from_user_id.rows[0].profile_name + "'s post: " + user_id_from_post.rows[0].post;
            } else {
                notification_to_others = "has also commented on " + profile_name_from_user_id.rows[0].profile_name + "'s post: " + user_id_from_post.rows[0].post.slice(0, 30) + '...';
            }

            var notification_from_self;
            if (user_id_from_post.rows[0].post.length <= 30) {
                notification_from_self = "has commented on his own post: " + user_id_from_post.rows[0].post;
            } else {
                notification_from_self = "has commented on his own post: " + user_id_from_post.rows[0].post.slice(0, 30) + '...';
            }

            if (user_id_from_post.rows[0].user_id !== payload.user) {
                for (var i=0; i<user_comments.rows.length; i++) {
                    await pool.query(
                        "INSERT INTO notifications (user_id, other_user_id, time_stamp, notification, seen) VALUES ($1, $2, to_timestamp($3), $4, $5)",
                        [
                            user_comments.rows[i].user_id,
                            payload.user,
                            (Date.now() / 1000.0),
                            notification_to_others,
                            false
                        ]
                    );
                }
            } else {
                for (var i=0; i<user_comments.rows.length; i++) {
                    await pool.query(
                        "INSERT INTO notifications (user_id, other_user_id, time_stamp, notification, seen) VALUES ($1, $2, to_timestamp($3), $4, $5)",
                        [
                            user_comments.rows[i].user_id,
                            payload.user,
                            (Date.now() / 1000.0),
                            notification_from_self,
                            false
                        ]
                    );
                }
            }
        }

        res.json({ new_comment_id });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/edit-comment', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        await pool.query(
            "UPDATE comments SET comment = $1 WHERE comment_id = $2", [
            req.body.comment,
            req.body.id
        ])
        res.status(200);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/delete-comment', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const comment_id = await pool.query(
            "DELETE FROM comments WHERE comment_id = $1 RETURNING comment_id", [
            req.body.id
        ]);

        res.json(comment_id.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;