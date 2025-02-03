const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/checkPermission", async (req, res) => {
    connection.query("SELECT * FROM user_group WHERE username = ? AND groupName = 'admin'", [req.user.username], (err, result) => {
        if (err) {
            console.error("Error selecting user_group:", err);
        } else {
            if (result.length > 0) {
                res.status(200).json({ isAdmin: true });
            } else {
                res.status(200).json({ isAdmin: false });
            }
        }
    });
});

module.exports = router;