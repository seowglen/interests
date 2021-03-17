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

router.post('/get-details', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const group_name = await pool.query("SELECT (group_name) FROM groups WHERE group_id = $1", [
            req.body.id
        ]);

        const members = await pool.query("SELECT (user_id) FROM user_group WHERE group_id = $1", [
            req.body.id
        ])

        var group_details = {};
        var group_members = [];

        group_details["group_name"] = group_name.rows[0].group_name;

        group_details['group_members'] = members.rows.length;

        res.json(group_details);
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

        const group_picture = await pool.query("SELECT group_picture FROM groups WHERE group_id = $1", [
            req.body.id
        ]);

        const path_name = '.' + group_picture.rows[0].group_picture;
        res.sendFile(path.join(__dirname, path_name));

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});
//test
module.exports = router;