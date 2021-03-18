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

        const profile_name = await pool.query("SELECT (profile_name) FROM profile WHERE profile_id = $1", [
            req.body.id
        ]);

        const groups = await pool.query(
            "SELECT * FROM (SELECT group_id FROM user_group WHERE user_id = $1) AS A INNER JOIN (SELECT group_id FROM user_group WHERE user_id IN (SELECT user_id FROM users WHERE profile_id = $2)) AS B ON A.group_id = B.group_id", [
            payload.user,
            req.body.id
        ]);

        const user_id = await pool.query(
            "SELECT user_id FROM users WHERE profile_id = $1", [
                req.body.id
            ]
        );
        
        var bool = false;
        if (user_id.rows[0].user_id === payload.user) {
            bool = true;
        } 
        const response = {
            profile_name: profile_name.rows[0].profile_name,
            number_groups: groups.rows.length,
            ownself: bool
        }

        res.json(response);
        // const id = req.body.id;
        // res.json({ id });

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

        const profile_picture = await pool.query("SELECT profile_picture FROM profile WHERE profile_id = $1", [
            req.body.id
        ]);

        const path_name = '.' + profile_picture.rows[0].profile_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});
//test
module.exports = router;