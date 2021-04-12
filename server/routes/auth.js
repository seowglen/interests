const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

// register

router.post('/register', validInfo, async (req, res) => {
    try {
        //1. destructure req body (name, email, password)
        const { name, email, password } = req.body;
        //2. check if user exists
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
            email
        ]);
        if (user.rows.length !== 0) {
            return res.status(401).json("User already exists!");
        }
        //3. Bcrypt user password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const bcryptPassword = await bcrypt.hash(password, salt);
        //4. Put user inside database
        const newUser = await pool.query(
            "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *", 
            [name, email, bcryptPassword]
        );
        //5. Create a new profile for the user with blank values
        await pool.query("INSERT INTO profile (profile_id, profile_name) VALUES ($1, $2)", [
            newUser.rows[0].profile_id, 
            name
        ]);
        //6. Generate our jwt token
        const token = jwtGenerator(newUser.rows[0].user_id);
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// login route

router.post("/login", validInfo, async (req, res) => {
    try {
        //1. destructure req body
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(401).json("Email and Password cannot be blank!")
        }
        //2. check if user doesnt exist
        const user = await pool.query("SELECT * FROM users WHERE user_email= $1", [
            email
        ]);
        if (user.rows.length === 0) {
            return res.status(401).json("User doesnt exist, please register!");
        }
        //3. check if incoming password is the same as database password
        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
        if (!validPassword) {
            return res.status(401).json("Password or Email is incorrect");
        }
        //4. give them jwt token
        const token = jwtGenerator(user.rows[0].user_id);
        res.json({token});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


router.get("/is-verify", authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;