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

        const user_groups = [];
        const all_groups = [];

        const groups_with_user = await pool.query("SELECT group_id FROM user_group WHERE user_id = $1", [
            req.user
        ]);

        for (var i = 0; i < groups_with_user.rows.length; i++) {
            user_groups.push(groups_with_user.rows[i].group_id)
        }

        const groups = await pool.query("SELECT group_id FROM groups");

        for (var i = 0; i < groups.rows.length; i++) {
            all_groups.push(groups.rows[i].group_id);
        }

        const groups_to_consider = all_groups.filter(x => !user_groups.includes(x));

        res.json({ user_groups, groups_to_consider});

    } catch (err) {
        console.error(err.message);
    }
});

router.get('/get-details', authorization, async (req, res) => {
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

module.exports = router;