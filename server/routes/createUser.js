const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const connection = require("../config/database");

router.post("/createUser", async (req, res) => {
    const data = req.body;

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (data.username.trim() === "") {
        return res.status(400).json({ message: "Username cannot be blank." });
    }

    if (!usernameRegex.test(data.username)) {
        return res.status(400).json({ message: "Username must be alphanumeric." });
    }

    if (!passwordRegex.test(data.password.trim())) {
        return res.status(400).json({ message: "Password must be 8 to 10 characters long and contain letters, numbers and special characters." });
    }

    if (data.email.trim() !== "" && !emailRegex.test(data.email)) {
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
                "INSERT INTO user_group (username, groupName) VALUES (?, ?)", 
                [data.username, group]
            );
        }

        res.status(201).json({ message: "user created" });

    } catch (err) {
        res.status(409).json({ message: "Username already exists." });
    }
});

module.exports = router;