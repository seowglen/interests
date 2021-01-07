const router = require("express").Router();
const { Router } = require("express");
const pool = require('../db');
const authorization = require("../middleware/authorization");
const multer  = require('multer');
const upload = multer({ dest: './photos/' })
const fs = require('fs')

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
})

router.post('/upload-image', upload.single('file'), async (req, res) => {
    try {
        let fileType = req.file.mimetype.split("/")[1];
        let newFileName = './photos/' + req.file.filename + "." + fileType;
        let oldFileName = './photos/' + req.file.filename;
        fs.rename(oldFileName, newFileName, () => console.log('callback'));
        res.send('200');
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
})

module.exports = router;