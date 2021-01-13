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

router.get('/', authorization, async (req, res) => {
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

router.post('/upload-image', upload.single('file'), async (req, res) => {
    try {

        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        let fileType = req.file.mimetype.split("/")[1];
        let newFileName = './photos/' + req.file.filename + "." + fileType;
        let oldFileName = './photos/' + req.file.filename;
        fs.rename(oldFileName, newFileName, () => console.log('callback'));

        const profile_id = await pool.query("SELECT (profile_id) FROM users WHERE user_id = $1", [
            payload.user
        ])

        const fName = await pool.query("UPDATE profile SET profile_picture = ($1) WHERE profile_id = ($2)", [
            newFileName,
            profile_id.rows[0].profile_id
        ]);
        res.json({ fName });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
})

router.post('/save-name', async (req, res) => {
    try {

        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_id = await pool.query("SELECT (profile_id) FROM users WHERE user_id = $1", [
            payload.user
        ])

        const name = await pool.query("UPDATE profile SET profile_name = ($1) WHERE profile_id = ($2)", [
            req.body.name,
            profile_id.rows[0].profile_id
        ]);
        res.json({ name });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
})

router.post('/save-info', async (req, res) => {
    try {

        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const profile_id = await pool.query("SELECT (profile_id) FROM users WHERE user_id = $1", [
            payload.user
        ])

        const info = await pool.query("UPDATE profile SET profile_info = ($1) WHERE profile_id = ($2)", [
            req.body.info,
            profile_id.rows[0].profile_id
        ]);
        res.json({ info });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
})

module.exports = router;