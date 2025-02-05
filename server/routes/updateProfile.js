const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const connection = require("../config/database");

router.patch("/updateProfile", async (req, res) => {
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
            "SELECT * FROM users WHERE username = ?", 
            [req.user.username]
        );

        const user = results[0];
    
        if (data.password === "") {
            hashedPassword = user.password;
        } else {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(data.password, salt);
        }

        await connection.promise().query(
            "UPDATE users SET password = ?, email = ? WHERE username = ?", 
            [hashedPassword, data.email, req.user.username]
        );

        res.status(200).json({ message: "profile updated" });
    } catch (err) {
        res.status(500).json({ message: "error" });
    }
});

module.exports = router;