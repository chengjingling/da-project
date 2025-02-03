const express = require("express");
const router = express.Router();

router.get("/logout", async (req, res) => {
    res
    .clearCookie("token")
    .status(200)
    .json({ message: "logged out" });
});

module.exports = router;