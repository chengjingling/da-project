const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/retrieveUserGroups", (req, res) => {
    connection.query("SELECT groupName FROM user_group WHERE username = ?", [req.user.username], (err, groups) => {
        if (err) {
            console.error("Error selecting groups:", err);
            res.status(500);
        } else {
            res.status(200).json({ username: req.user.username, groups: groups });
        }
    });
});

module.exports = router;