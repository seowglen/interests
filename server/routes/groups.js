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

        const groups_with_user = await pool.query("SELECT group_id, group_name FROM groups WHERE group_id IN (SELECT group_id FROM user_group WHERE user_id = $1)", [
            req.user
        ]);

        for (var i = 0; i < groups_with_user.rows.length; i++) {
            user_groups.push(groups_with_user.rows[i])
        }

        const groups = await pool.query("SELECT group_id, group_name FROM groups");

        for (var i = 0; i < groups.rows.length; i++) {
            all_groups.push(groups.rows[i]);
        }

        const groups_to_consider = all_groups.filter(x => !user_groups.find(({group_id}) => x.group_id === group_id));

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

router.post('/postName', async (req, res) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const group = await pool.query("SELECT * FROM groups WHERE group_name= $1", [
            req.body.name
        ]);

        if (group.rows.length !== 0) {
            var err = "Group already exists";
            return res.json({err: err});
        } else {
            const group_id = await pool.query("INSERT INTO groups (group_name, group_info, administrator) VALUES ($1, $2, $3) RETURNING group_id, group_name", [
                req.body.name,
                req.body.info,
                payload.user
            ]);

            await pool.query("INSERT INTO user_group (user_id, group_id) VALUES ($1, $2)", [
                payload.user,
                group_id.rows[0].group_id
            ]);
             
            res.json(group_id.rows[0])
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
})

module.exports = router;