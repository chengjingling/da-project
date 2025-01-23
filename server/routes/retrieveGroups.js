const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/retrieveGroups", (req, res) => {
    connection.query("SELECT DISTINCT groupName FROM user_group", (err, groups) => {
        if (err) {
            console.error("Error selecting groups:", err);
            return;
        }
    
        console.log("Groups:", groups);
        res.json({ groups: groups });
    });
});

module.exports = router;