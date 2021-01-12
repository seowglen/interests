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

module.exports = router;