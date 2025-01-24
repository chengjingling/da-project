const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.post("/createGroup", (req, res) => {
    const data = req.body;
    data.username = "";
    
    connection.query("INSERT INTO user_group SET ?", data, (err, result) => {
        if (err) {
            res.status(409).json({ message: "group already exists" });
        } else {
            res.status(201).json({ message: "group created" });
        }
   });
});

module.exports = router;