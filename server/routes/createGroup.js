const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.post("/createGroup", (req, res) => {
    const data = req.body;
    data.username = "";

    const groupNameRegex = /^[a-zA-Z0-9_]+$/;
    
    if (data.groupName === "") {
        return res.status(400).json({ message: "Group name cannot be blank." });
    }

    if (data.groupName.length > 50) {
        return res.status(400).json({ message: "Group name cannot be more than 50 characters." });
    }

    if (!groupNameRegex.test(data.groupName)) {
        return res.status(400).json({ message: "Group name can only contain letters, numbers and underscores." });
    }
    
    connection.query("INSERT INTO user_group SET ?", data, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).json({ message: "Group name already exists." });
            } else {
                res.status(500).json({ message: "An error occurred, please try again." });
            }
        } else {
            res.status(201).json({ message: "group created" });
        }
   });
});

module.exports = router;