const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/retrieveGroups", (req, res) => {
    connection.query("SELECT DISTINCT groupName FROM user_group", (err, groups) => {
        if (err) {
            res.status(500);
        } else {
            res.status(200).json({ groups: groups });
        }
    });
});

module.exports = router;