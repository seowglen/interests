const router = require("express").Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');
const path = require('path');
const jwtGenerator = require('../utils/jwtGenerator');
const jwt = require('jsonwebtoken');
const { pathToFileURL } = require("url");
require('dotenv').config();

router.get('/', authorization, async (req, res) => {
    try {

        const notifications = await pool.query("SELECT * FROM notifications WHERE user_id = ($1) ORDER BY time_stamp DESC", [
            req.user
        ])

        if (notifications.rows === undefined) {
            res.json([]);
        } else {
            res.json(notifications.rows);
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/get-name', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_name = await pool.query("SELECT profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id = ($1))", [
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

        const profile_picture = await pool.query("SELECT profile_picture FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id = ($1))", [
            req.body.id
        ]);

        const path_name = '.' + profile_picture.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/see-notifications', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        await pool.query(
            "UPDATE notifications SET seen = ($1) WHERE user_id = ($2) AND seen = ($3)", 
            [
                true,
                payload.user,
                false
            ]
        )
        
        res.status(200);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;