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
const { strict } = require("assert");

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
            "SELECT time_stamp, post, group_name FROM posts WHERE post_id = $1", [
            req.body.id
        ]);

        const comment_ids = await pool.query(
            "SELECT comment_id, time_stamp FROM comments WHERE post_id = $1 ORDER BY time_stamp ASC", [
            req.body.id
        ]);

        const likes_num = await pool.query(
            "SELECT user_id FROM likes WHERE post_id = $1", [
            req.body.id
        ]);

        const profile_id = await pool.query(
            "SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM posts WHERE post_id = $1)", [
            req.body.id
        ]);

        const user_id = await pool.query("SELECT user_id FROM posts WHERE post_id = $1", [req.body.id]);

        if (user_id.rows[0].user_id === payload.user) {
            post.rows[0]['user_post'] = true;
        } else {
            post.rows[0]['user_post'] = false;
        }

        if (comment_ids.rows === undefined) {
            post.rows[0]['comment_ids'] = []
        } else {
            var comments = [];
            for (var i=0; i<comment_ids.rows.length; i++) {
                comments.push(comment_ids.rows[i].comment_id)
            }
            post.rows[0]['comment_ids'] = comments;
        }

        if (likes_num.rows === undefined) {
            post.rows[0]['likes'] = []
        } else {
            var likes = [];
            var liked = false;
            for (var i=0; i<likes_num.rows.length; i++) {
                likes.push(likes_num.rows[i].user_id)
            }

            if (likes.includes(payload.user)) {
                liked = true;
            }

            post.rows[0]['likes'] = likes;
            post.rows[0]['liked'] = liked;
        }

        post.rows[0]['profile_id'] = profile_id.rows[0].profile_id;
        res.json(post.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/create-like', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const like_id = await pool.query(
            "INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING user_id", [
            req.body.id,
            payload.user
        ])

        const new_like_id = like_id.rows[0];

        const user_id_from_post = await pool.query(
            "SELECT user_id, post FROM posts WHERE post_id = ($1)",
            [
                req.body.id
            ]
        )
        
        var notification;
        if (user_id_from_post.rows[0].post.length <= 30) {
            notification = "has liked your post: " + user_id_from_post.rows[0].post;
        } else {
            notification = "has liked your post: " + user_id_from_post.rows[0].post.slice(0, 30) + '...';
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

        const user_likes = await pool.query(
            "SELECT user_id FROM likes WHERE post_id = ($1) AND user_id != ($2) AND user_id != ($3)",
            [
                req.body.id,
                user_id_from_post.rows[0].user_id,
                payload.user
            ]
        )
        
        if (user_likes !== undefined) {
            const profile_name_from_user_id = await pool.query(
                "SELECT profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id = ($1))",
                [
                    user_id_from_post.rows[0].user_id
                ]
            );

            var notification_to_others;
            if (user_id_from_post.rows[0].post.length <= 30) {
                notification_to_others = "has also liked " + profile_name_from_user_id.rows[0].profile_name + "'s post: " + user_id_from_post.rows[0].post;
            } else {
                notification_to_others = "has also liked " + profile_name_from_user_id.rows[0].profile_name + "'s post: " + user_id_from_post.rows[0].post.slice(0, 30) + '...';
            }

            if (user_id_from_post.rows[0].user_id !== payload.user) {
                for (var i=0; i<user_likes.rows.length; i++) {
                    await pool.query(
                        "INSERT INTO notifications (user_id, other_user_id, time_stamp, notification, seen) VALUES ($1, $2, to_timestamp($3), $4, $5)",
                        [
                            user_likes.rows[i].user_id,
                            payload.user,
                            (Date.now() / 1000.0),
                            notification_to_others,
                            false
                        ]
                    );
                }
            }
        }

        res.json({ new_like_id });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/create-unlike', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        await pool.query(
            "DELETE FROM likes WHERE post_id = ($1) AND user_id = ($2)", [
            req.body.id,
            payload.user
        ]);

        const likes_num = await pool.query(
            "SELECT user_id FROM likes WHERE post_id = ($1)", [
            req.body.id,
        ]);

        var res_likes = {}

        if (likes_num.rows === undefined) {
            res_likes['likes'] = []
        } else {
            var likes = [];
            for (var i=0; i<likes_num.rows.length; i++) {
                likes.push(likes_num.rows[i].user_id)
            }
            res_likes['likes'] = likes;
        }
        res.json(res_likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-likes-names', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const likes_users = await pool.query(
            "SELECT profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM likes WHERE post_id = $1))", [
            req.body.id
        ])

        var res_likes_names = {}

        if (likes_users.rows === undefined) {
            res_likes_names['likes_names'] = []
        } else {
            var likes_names = [];
            for (var i=0; i<likes_users.rows.length; i++) {
                likes_names.push(likes_users.rows[i].profile_name)
            }
            res_likes_names['likes_names'] = likes_names;
        }
        res.json(res_likes_names);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/edit-post', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        await pool.query(
            "UPDATE posts SET post = $1 WHERE post_id = $2", [
            req.body.post,
            req.body.id
        ])
        res.status(200);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/delete-post', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        await pool.query(
            "DELETE FROM likes WHERE post_id = $1", [
            req.body.id
        ]);

        await pool.query(
            "DELETE FROM comments WHERE post_id = $1", [
            req.body.id
        ]);

        const post_id = await pool.query(
            "DELETE FROM posts WHERE post_id = $1 RETURNING post_id", [
            req.body.id
        ]);

        res.json(post_id.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;