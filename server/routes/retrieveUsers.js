const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/retrieveUsers", (req, res) => {
    connection.query("SELECT * FROM users", (err, users) => {
        if (err) {
            console.error("Error selecting users:", err);
            return;
        }
    
        console.log("Users:", users);
        res.json({ users: users });
    });
});

module.exports = router;