const express = require("express");
const router = express.Router();
const connection = require("../config/database");
const bcrypt = require("bcryptjs");

router.post("/authenticateUser", (req, res) => {
    const { username, password } = req.body;
    
    connection.query("SELECT password FROM users WHERE username = '" + username + "'", (err, result) => {
        if (err) {
            console.error("Error selecting user:", err);
        } else if (result.length === 0) {
            res.json({ status: 401 });
        } else {
            const hashedPassword = result[0].password;

            bcrypt.compare(password, hashedPassword, async function (err, isMatch) {
                if (isMatch) {
                    res.json({ status: 200 });
                } else {
                    res.json({ status: 401 });
                }
            });
        }
    });
});

module.exports = router;