const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/retrieveUsers", (req, res) => {
    connection.query("SELECT * FROM users", (err, users) => {
        if (err) {
            res.status(500);
        } else {
            res.status(200).json({ users: users });
        }
    });
});

module.exports = router;