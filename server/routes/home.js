const router = require("express").Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const path = require('path');
const jwtGenerator = require('../utils/jwtGenerator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/', authorization, async (req, res) => {
    try {
        
        const res_array = [];

        const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
            req.user
        ]);

        const profile_id = await pool.query("SELECT * FROM profile WHERE profile_id = $1", [
            user.rows[0].profile_id
        ]);

        const group_names = [];

        const groups = await pool.query("SELECT group_name FROM groups WHERE group_id IN (SELECT group_id FROM user_group WHERE user_id = $1)", [
            req.user
        ])

        for (var i = 0; i < groups.rows.length; i++) {
            group_names.push(groups.rows[i].group_name);
        }

        res_array.push(user.rows[0]);
        res_array.push(profile_id.rows[0]);
        res_array.push({group_names: group_names});
        // res.json(user.rows[0]);
        res.json(res_array);

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

        if (profile.rows[0].profile_picture) {
            const path_name = '.' + profile.rows[0].profile_picture;
            res.sendFile(path.join(__dirname, path_name));
        } else {
            res.status(403).json("Picture not found.")
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.get('/get-posts', authorization, async (req, res) => {
    try {
        const post_id_arr = []
        
        // SELECT ALL POSTS FROM logged in user, and all posts from confirmed friends.
        const post_ids = await pool.query(
            "SELECT * FROM posts WHERE user_id = $1 UNION SELECT * FROM posts WHERE user_id IN (SELECT friend_id FROM friends WHERE user_id = $2 AND request = $3) ORDER BY time_stamp DESC", [
            req.user,
            req.user,
            "accepted"
        ]);

        for (var i = 0; i < post_ids.rows.length; i++) {
            post_id_arr.push(post_ids.rows[i].post_id)
        }

        // SELECT ALL POSTS that are in the same group as the USER
        const posts_same_group = [];

        const posts_same_group_arr = await pool.query(
            "SELECT * FROM posts WHERE group_name IN (SELECT group_name FROM groups WHERE group_id IN (SELECT group_id FROM user_group WHERE user_id = $1))",[
            req.user
        ]);

        for (var i = 0; i < posts_same_group_arr.rows.length; i++) {
            posts_same_group.push(posts_same_group_arr.rows[i].post_id)
        }

        const arr = post_id_arr.filter(x => posts_same_group.includes(x));

        res.json({ arr });

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
            "INSERT INTO posts (user_id, time_stamp, post, group_name) VALUES ($1, to_timestamp($2), $3, $4) RETURNING post_id", [
            payload.user,
            (Date.now() / 1000.0),
            req.body.post,
            req.body.group
        ]);

        const new_post_id = post_id.rows[0];
        res.json({ new_post_id });

    } catch (error) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;