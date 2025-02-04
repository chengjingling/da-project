const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const connection = require("../config/database");

router.put("/updateUser", async (req, res) => {
    const data = req.body;
    
    let hashedPassword;

    try {
        if (data.newPassword) {
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,10}$/;

            if (!passwordRegex.test(data.newPassword.trim())) {
                return res.status(400).json({ message: "Password must be 8 to 10 characters long and contain letters, numbers and special characters."});
            }

            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.newPassword, salt);
        } else {
            hashedPassword = data.password;
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (data.email.trim() !== "" && !emailRegex.test(data.email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        await connection.promise().query(
            "UPDATE users SET password = ?, email = ?, enabled = ? WHERE username = ?", 
            [hashedPassword, data.email, data.enabled, data.username]
        );

        const [existingGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE username = ?", 
            [data.username]
        );

        const existingGroups = existingGroupsResults.map(group => group.groupName);

        const groupsToAdd = data.selectedGroups.filter(group => !existingGroups.includes(group));
        const groupsToRemove = existingGroups.filter(group => !data.selectedGroups.includes(group));

        for (const group of groupsToAdd) {
            await connection.promise().query(
                "INSERT INTO user_group (username, groupName) VALUES (?, ?)", 
                [data.username, group]
            );
        }

        for (const group of groupsToRemove) {
            await connection.promise().query(
                "DELETE FROM user_group WHERE username = ? AND groupName = ?", 
                [data.username, group]
            );
        }

        res.status(200).json({ message: "user updated" });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;