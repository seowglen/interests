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
        const friends_profile_id = [];

        const friends = await pool.query("SELECT friend_id FROM friends WHERE user_id = $1 AND request = $2", [
            req.user,
            "accepted"
        ]);
        
        for (var i = 0; i < friends.rows.length; i++) {
            var profile_id = await pool.query("SELECT profile_id, profile_name FROM profile WHERE profile_id IN (SELECT profile_id from users WHERE user_id = $1)", [
                friends.rows[i].friend_id
            ]);
            friends_profile_id.push(profile_id.rows[0]);
        }

        const friends_requests = [];

        const requests = await pool.query("SELECT friend_id FROM friends WHERE user_id = $1 AND request = $2", [
            req.user,
            "receiver"
        ]);

        for (var i = 0; i < requests.rows.length; i++) {
            var profile_id_request = await pool.query("SELECT profile_id, profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id = $1)", [
                requests.rows[i].friend_id
            ]);
            friends_requests.push(profile_id_request.rows[0]);
        }

        const user_same_group = [];

        const same_group = await pool.query("SELECT profile_id, profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM user_group WHERE user_id != $1 AND group_id IN (SELECT group_id FROM user_group WHERE user_id = $1)))", [
            req.user
        ])

        for (var i = 0; i < same_group.rows.length; i++) {
            user_same_group.push(same_group.rows[i]);
        }

        // console.log(user_same_group)

        const all_users = [];

        const profiles = await pool.query("SELECT profile_id, profile_name FROM profile WHERE profile_id IN (SELECT profile_id FROM users WHERE user_id != $1)", [
            req.user
        ]);

        for (var i = 0; i < profiles.rows.length; i++) {
            all_users.push(profiles.rows[i]);
        }

        // console.log(all_users)

        // friends to consider
        // 1. Filter out users who are not in the same group as user
        // 2. Filter out friends of user
        // 3. Filter out friend requests to user
        // const friends_to_consider = all_users.filter(x => user_same_group.includes(x)).filter(x => !friends_profile_id.includes(x)).filter(x => !friends_requests.includes(x));
        const friends_to_consider = all_users.filter(x => user_same_group.find(({profile_id}) => x.profile_id === profile_id)).filter(x => !friends_profile_id.find(({profile_id}) => x.profile_id === profile_id)).filter(x => !friends_requests.find(({profile_id}) => x.profile_id === profile_id));

        res.json({ friends_requests, friends_profile_id, friends_to_consider });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
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