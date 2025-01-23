const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.post("/createGroup", (req, res) => {
    const data = req.body;
    data.username = "";
    
    connection.query("INSERT INTO user_group SET ?", data, (err, result) => {
        if (err) {
            console.error("Error inserting user-group:", err);
            return;
        }
        
        console.log("User-group inserted successfully!");
        res.json({ status: 200 });
   });
});

module.exports = router;