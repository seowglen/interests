const router = require("express").Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const path = require('path');

router.get('/', authorization, async (req, res) => {
    try {
        
        const res_array = [];

        const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
            req.user
        ]);

        const profile_id = await pool.query("SELECT * FROM profile WHERE profile_id = $1", [
            user.rows[0].profile_id
        ]);

        res_array.push(user.rows[0]);
        res_array.push(profile_id.rows[0]);
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

        const path_name = '.' + profile.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

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

        res.json({ post_id_arr });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;