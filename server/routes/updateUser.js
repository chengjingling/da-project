const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const connection = require("../config/database");

router.put("/updateUser", async (req, res) => {
    const data = req.body;
    
    let hashedPassword;

    try {
        if (data.newPassword) {
            // bcrypt.genSalt and bcrypt.hash using promises
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.newPassword, salt);
        } else {
            hashedPassword = data.password;
        }

        // Update user query
        await connection.promise().query(
            "UPDATE users SET password = ?, email = ?, enabled = ? WHERE username = ?", 
            [hashedPassword, data.email, data.enabled, data.username]
        );

        // Get existing groups
        const [existingGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE username = ?", 
            [data.username]
        );

        const existingGroups = existingGroupsResults.map(group => group.groupName);

        const groupsToAdd = data.selectedGroups.filter(group => !existingGroups.includes(group));
        const groupsToRemove = existingGroups.filter(group => !data.selectedGroups.includes(group));

        // Add groups
        for (const group of groupsToAdd) {
            await connection.promise().query(
                "INSERT INTO user_group (username, groupName) VALUES (?, ?)", 
                [data.username, group]
            );
        }

        // Remove groups
        for (const group of groupsToRemove) {
            await connection.promise().query(
                "DELETE FROM user_group WHERE username = ? AND groupName = ?", 
                [data.username, group]
            );
        }

        res.status(200).json({ message: "updated" });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;