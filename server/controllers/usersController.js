const connection = require("../config/database");
const bcrypt = require("bcryptjs");

const retrieveUser = (req, res) => {
    connection.query("SELECT * FROM users WHERE user_username = ?", [req.user.username], (err, users) => {
        if (err) {
            res.status(500).json({ message: err });
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

        res.status(200).json({ message: "profile updated" });
    } catch (err) {
        res.status(500).json({ message: "error" });
    }
};

const retrieveUsers = (req, res) => {
    connection.query("SELECT * FROM users", (err, users) => {
        if (err) {
            res.status(500);
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
        return res.status(400).json({ message: "Username must be alphanumeric." });
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

        res.status(201).json({ message: "user created" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ message: "Username already exists." });
        } else {
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
            hashedPassword = data.password;
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (data.email !== "" && !emailRegex.test(data.email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        if (data.username === "ADMIN" && !data.selectedGroups.includes("admin")) {
            return res.status(400).json({ message: "ADMIN cannot be removed from the admin group." });
        }

        if (data.username === "ADMIN" && !data.enabled) {
            return res.status(400).json({ message: "ADMIN cannot be disabled." });
        }

        await connection.promise().query(
            "UPDATE users SET user_password = ?, user_email = ?, user_enabled = ? WHERE user_username = ?", 
            [hashedPassword, data.email, data.enabled, data.username]
        );

        const [existingGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE user_group_username = ?", 
            [data.username]
        );

        const existingGroups = existingGroupsResults.map(group => group.groupName);

        const groupsToAdd = data.selectedGroups.filter(group => !existingGroups.includes(group));
        const groupsToRemove = existingGroups.filter(group => !data.selectedGroups.includes(group));

        for (const group of groupsToAdd) {
            await connection.promise().query(
                "INSERT INTO user_group VALUES (?, ?)", 
                [data.username, group]
            );
        }

        for (const group of groupsToRemove) {
            await connection.promise().query(
                "DELETE FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?", 
                [data.username, group]
            );
        }

        res.status(200).json({ message: "user updated" });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const retrieveGroups = (req, res) => {
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
};

const createGroup = (req, res) => {
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
};

module.exports = { retrieveUser, updateProfile, retrieveUsers, createUser, updateUser, retrieveGroups, createGroup };