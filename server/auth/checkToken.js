const express = require("express");
const router = express.Router();

router.get("/checkToken", async (req, res) => {
    const token = req.cookies.token;

    if (token) {
        res.status(200).json({ token: token });
    } else {
        res.status(401).json({ token: "" });
    }
});

module.exports = router;