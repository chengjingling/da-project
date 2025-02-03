const express = require("express");
const router = express.Router();
const connection = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let group;

    connection.query("SELECT * FROM user_group WHERE username = ? AND groupName = 'admin'", [username], async (err, result) => {
        if (err) {
            console.error("Error selecting user group:", err);
            res.status(500);
        } else if (result.length === 0) {
            group = "user";
        } else {
            group = "admin";
        }
    });
    
    connection.query("SELECT password FROM users WHERE username = ?", [username], async (err, result) => {
        if (err) {
            console.error("Error selecting user:", err);
            res.status(500);
        } else if (result.length === 0) {
            res.status(401).json({ message: "Username or password is incorrect."});
        } else {
            const hashedPassword = result[0].password;
            const isMatch = await bcrypt.compare(password, hashedPassword);
            
            if (isMatch) {
                const data = {
                    ipAddress: req.ip,
                    browserType: req.headers["user-agent"],
                    username: username
                };
            
                const token = jwt.sign(data, process.env.JWT_SECRET_KEY);
                
                res.cookie("token", token, { httpOnly: true });

                res.status(200).json({ token: token, group: group });
            } else {
                res.status(401).json({ message: "Username or password is incorrect."});
            }
        }
    });
});

module.exports = router;