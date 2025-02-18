const connection = require("../config/database");
const bcrypt = require("bcryptjs");

const retrieveUser = (req, res) => {
    connection.query("SELECT * FROM users WHERE user_username = ?", [req.user.username], (err, users) => {
        if (err) {
            console.error("Error selecting user:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ user: users[0] });
        }
    });
};

const updateProfile = async (req, res) => {
    const data = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,10}$/;

    if (data.email !== "" && !emailRegex.test(data.email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    if (data.password !== "" && !passwordRegex.test(data.password.trim())) {
        return res.status(400).json({ message: "Password must be 8 to 10 characters long and contain letters, numbers and special characters." });
    }

    try {
        let hashedPassword;

        const [results] = await connection.promise().query(
            "SELECT * FROM users WHERE user_username = ?", 
            [req.user.username]
        );

        const user = results[0];
    
        if (data.password === "") {
            hashedPassword = user.user_password;
        } else {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.password, salt);
        }

        await connection.promise().query(
            "UPDATE users SET user_password = ?, user_email = ? WHERE user_username = ?", 
            [hashedPassword, data.email, req.user.username]
        );

        res.status(200).json({ message: "Profile updated." });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

const retrieveUsers = (req, res) => {
    connection.query("SELECT * FROM users", (err, users) => {
        if (err) {
            console.error("Error selecting users:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ users: users });
        }
    });
};

const createUser = async (req, res) => {
    const data = req.body;

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (data.username === "") {
        return res.status(400).json({ message: "Username cannot be blank." });
    }

    if (data.username.length > 50) {
        return res.status(400).json({ message: "Username cannot be more than 50 characters." });
    }

    if (!usernameRegex.test(data.username)) {
        return res.status(400).json({ message: "Username can only contain letters and numbers." });
    }

    if (!passwordRegex.test(data.password.trim())) {
        return res.status(400).json({ message: "Password must be 8 to 10 characters long and contain letters, numbers and special characters." });
    }

    if (data.email !== "" && !emailRegex.test(data.email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        await connection.promise().query(
            "INSERT INTO users VALUES (?, ?, ?, ?)", 
            [data.username, hashedPassword, data.email, data.enabled]
        );

        for (const group of data.groups) {
            await connection.promise().query(
                "INSERT INTO user_group VALUES (?, ?)", 
                [data.username, group]
            );
        }

        res.status(201).json({ message: "User created." });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ message: "Username already exists." });
        } else {
            console.error("Error creating user:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        }
    }
};

const updateUser = async (req, res) => {
    const data = req.body;
    
    try {
        let hashedPassword;
    
        if (data.newPassword) {
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,10}$/;

            if (!passwordRegex.test(data.newPassword.trim())) {
                return res.status(400).json({ message: "Password must be 8 to 10 characters long and contain letters, numbers and special characters." });
            }

            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.newPassword, salt);
        } else {
            hashedPassword = data.user_password;
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (data.user_email !== "" && !emailRegex.test(data.user_email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        if (data.user_username === "ADMIN" && !data.selectedGroups.includes("admin")) {
            return res.status(400).json({ message: "ADMIN cannot be removed from the admin group." });
        }

        if (data.user_username === "ADMIN" && !data.user_enabled) {
            return res.status(400).json({ message: "ADMIN cannot be disabled." });
        }

        await connection.promise().query(
            "UPDATE users SET user_password = ?, user_email = ?, user_enabled = ? WHERE user_username = ?", 
            [hashedPassword, data.user_email, data.user_enabled, data.user_username]
        );

        const [existingGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE user_group_username = ?", 
            [data.user_username]
        );

        const existingGroups = existingGroupsResults.map(group => group.user_group_groupName);

        const groupsToAdd = data.selectedGroups.filter(group => !existingGroups.includes(group));
        const groupsToRemove = existingGroups.filter(group => !data.selectedGroups.includes(group));

        for (const group of groupsToAdd) {
            await connection.promise().query(
                "INSERT INTO user_group VALUES (?, ?)", 
                [data.user_username, group]
            );
        }

        for (const group of groupsToRemove) {
            await connection.promise().query(
                "DELETE FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?", 
                [data.user_username, group]
            );
        }

        res.status(200).json({ message: "User updated." });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

const retrieveGroups = (req, res) => {
    connection.query("SELECT * FROM user_group", (err, groups) => {
        if (err) {
            console.error("Error selecting user_groups:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            let groupsObject = {"all": []};

            for (const group of groups) {
                if (group.user_group_username === "") {
                    groupsObject.all.push(group.user_group_groupName);
                } else {
                    if (groupsObject[group.user_group_username]) {
                        groupsObject[group.user_group_username].push(group.user_group_groupName);
                    } else {
                        groupsObject[group.user_group_username] = [group.user_group_groupName];
                    }
                }
            }

            res.status(200).json(groupsObject);
        }
    });
};

const createGroup = (req, res) => {
    const data = req.body;
    data.user_group_username = "";

    const groupNameRegex = /^[a-zA-Z0-9_]+$/;
    
    if (data.user_group_groupName === "") {
        return res.status(400).json({ message: "Group name cannot be blank." });
    }

    if (data.user_group_groupName.length > 50) {
        return res.status(400).json({ message: "Group name cannot be more than 50 characters." });
    }

    if (!groupNameRegex.test(data.user_group_groupName)) {
        return res.status(400).json({ message: "Group name can only contain letters, numbers and underscores." });
    }
    
    connection.query("INSERT INTO user_group SET ?", data, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).json({ message: "Group name already exists." });
            } else {
                console.error("Error inserting user_group:", err);
                res.status(500).json({ message: "An error occurred, please try again." });
            }
        } else {
            res.status(201).json({ message: "Group created." });
        }
   });
};

module.exports = { retrieveUser, updateProfile, retrieveUsers, createUser, updateUser, retrieveGroups, createGroup };