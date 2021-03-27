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

        const group_profile = await pool.query("SELECT group_name, group_info FROM groups WHERE group_id = $1", [
            req.body.id
        ]);

        const group_joined = await pool.query("SELECT * FROM user_group WHERE user_id = ($1) AND group_id = ($2)", [
            payload.user,
            req.body.id
        ]);

        const members = await pool.query("SELECT profile_id FROM users WHERE user_id IN (SELECT user_id FROM user_group WHERE group_id = $1)", [
            req.body.id
        ]);

        const admin = await pool.query("SELECT administrator FROM groups WHERE group_id = ($1)", [
            req.body.id
        ]);

        var profile_ids = [];
        for (var i=0; i<members.rows.length; i++) {
            profile_ids.push(members.rows[i].profile_id);
        }
        group_profile.rows[0]['profile_ids'] = profile_ids;

        if (group_joined.rows.length === 0) {
            group_profile.rows[0]["group_joined"] = false;
        } else {
            group_profile.rows[0]["group_joined"] = true;
        }
        
        if (admin.rows[0].administrator !== payload.user) {
            group_profile.rows[0]['admin'] = false;
        } else {
            group_profile.rows[0]['admin'] = true;
        }

        res.json(group_profile.rows[0]);

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

        // const profile_id = await pool.query("SELECT (profile_id) FROM users WHERE user_id = $1", [
        //     payload.user
        // ])

        const fName = await pool.query("UPDATE groups SET group_picture = ($1) WHERE group_id = ($2)", [
            newFileName,
            req.body.id
        ]);
        res.json({ id: req.body.id });

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

        // const profile_id = await pool.query("SELECT (profile_id) FROM users WHERE user_id = $1", [
        //     payload.user
        // ])

        const name = await pool.query("UPDATE groups SET group_name = ($1) WHERE group_id = ($2)", [
            req.body.name,
            req.body.id
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

        // const profile_id = await pool.query("SELECT (profile_id) FROM users WHERE user_id = $1", [
        //     payload.user
        // ])

        const info = await pool.query("UPDATE groups SET group_info = ($1) WHERE group_id = ($2)", [
            req.body.info,
            req.body.id
        ]);
        res.json({ info });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.post('/join-group', async (req, res) => {
    try {

        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        const result = await pool.query("INSERT INTO user_group (user_id, group_id) VALUES ($1, $2)", [
            payload.user,
            req.body.id
        ])

        const profile_id = await pool.query("SELECT profile_id FROM users WHERE user_id = ($1)", [
            payload.user
        ]);

        res.json(profile_id.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
})

router.post('/leave-group', async (req, res) => {
    try {

        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        // 1. All likes related to a user’s post to friends labelled by the group that the user wants to leave will be deleted.
        // All likes from a user in a post to friends labelled by the group that the user wants to leave will be deleted.
        await pool.query(
            `DELETE FROM likes WHERE user_id = ($1) AND post_id IN (
                SELECT post_id FROM posts WHERE group_name IN (
                    SELECT group_name FROM groups WHERE group_id = ($2)
                )
            ) 
            `, [payload.user, req.body.id]
        );

        await pool.query(
            `DELETE FROM likes WHERE post_id IN (
                SELECT post_id FROM posts WHERE user_id = ($1) and group_name IN (
                    SELECT group_name FROM groups WHERE group_id = ($2)
                )
            )
            `, [payload.user, req.body.id]
        );
        
        // 2. All comments related to a user’s post to friends labelled by the group that the user wants to leave will be deleted.
        // ALL comments from a user in a post to friends labelled by the group that the user wants to leave will be deleted.
        await pool.query(
            `DELETE FROM comments WHERE user_id = ($1) AND post_id IN (
                SELECT post_id FROM posts WHERE group_name IN (
                    SELECT group_name FROM groups WHERE group_id = ($2)
                )
            )
            `, [payload.user, req.body.id]
        );

        await pool.query(
            `DELETE FROM comments WHERE post_id IN (
                SELECT post_id FROM posts WHERE user_id = ($1) and group_name IN (
                    SELECT group_name FROM groups WHERE group_id = ($2)
                )
            )
            `, [payload.user, req.body.id]
        );

        // 3. All user’s posts to friends labelled by the group that the user wants to leave will be deleted.
        await pool.query(
            `DELETE FROM posts WHERE user_id = ($1) AND group_name IN (
                SELECT group_name FROM groups WHERE group_id = ($2)
            )
            `, [payload.user, req.body.id]
        );

        // 4. All forum comments by a user in the group that the user wants to leave will be deleted, including nested comments or replies to that user.
        await pool.query(
            `DELETE FROM forum_comments
            WHERE forum_comment_id IN (
                WITH RECURSIVE CommentCTE AS (
                    SELECT forum_comment_id, parent_comment_id, user_id, time_stamp,
                        lpad(forum_comment_id::text, 4) sort_key
                    FROM forum_comments
                    WHERE parent_comment_id is NULL 
                            and user_id IN (
                        SELECT user_id FROM forum_comments WHERE user_id = ($1)	
                    ) or parent_comment_id IN (
                        SELECT parent_comment_id 
                        FROM forum_comments 
                        WHERE user_id = ($2)
                    ) and user_id IN (
                        SELECT user_id FROM forum_comments WHERE user_id = ($3)
                    )
                    UNION ALL
                    SELECT child.forum_comment_id, child.parent_comment_id, child.user_id, child.time_stamp,
                        concat(CommentCTE.sort_key, ':', lpad(child.forum_comment_id::text, 4))
                    FROM forum_comments child
                    JOIN CommentCTE
                    ON child.parent_comment_id = CommentCTE.forum_comment_id
                )
                SELECT forum_comment_id FROM CommentCTE group by forum_comment_id
            ) AND forum_post_id IN (
                SELECT forum_post_id FROM forum_posts WHERE group_id = ($4)
            )
            `, [payload.user, payload.user, payload.user, req.body.id]
        )
        
        // 5. All forum posts made by a user in the group that the user wants to leave will be deleted.
        await pool.query(
            `DELETE FROM forum_posts WHERE user_id = ($1) AND group_id = ($2)`, 
            [payload.user, req.body.id]
        );

        // 6. Finally, the row associating the user with the group in the user group table will be deleted.
        const result = await pool.query("DELETE FROM user_group WHERE user_id = ($1) AND group_id = ($2)", [
            payload.user,
            req.body.id
        ]);

        const profile_id = await pool.query("SELECT profile_id FROM users WHERE user_id = ($1)", [
            payload.user
        ]);

        res.json(profile_id.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
})

module.exports = router;