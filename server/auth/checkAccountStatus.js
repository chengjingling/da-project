const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/checkAccountStatus", async (req, res) => {
    connection.query("SELECT * FROM users WHERE username = ?", [req.user.username], (err, result) => {
        if (err) {
            console.error("Error selecting user:", err);
        } else {
            res.status(200).json({ isEnabled: result[0].enabled });
        }
    });
});

module.exports = router;