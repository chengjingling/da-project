const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/retrieveUser", (req, res) => {
    connection.query("SELECT * FROM users WHERE username = ?", [req.user.username], (err, users) => {
        if (err) {
            res.status(500).json({ message: err });
        } else {
            res.status(200).json({ user: users[0] });
        }
    });
});

module.exports = router;