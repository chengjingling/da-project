const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/retrieveGroups", (req, res) => {
    connection.query("SELECT * FROM user_group", (err, groups) => {
        if (err) {
            res.status(500);
        } else {
            let groupsObject = {"all": []};

            for (const group of groups) {
                if (group.username === "") {
                    groupsObject.all.push(group.groupName);
                } else {
                    if (groupsObject[group.username]) {
                        groupsObject[group.username].push(group.groupName);
                    } else {
                        groupsObject[group.username] = [group.groupName];
                    }
                }
            }

            res.status(200).json(groupsObject);
        }
    });
});

module.exports = router;