const connection = require("../config/database");

const createApp = (req, res) => {
    connection.query("INSERT INTO applications SET ?", req.body, (err) => {
        if (err) {
            console.error("Error inserting application:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(201).json({ message: "Application created." });
        }
    });
};

module.exports = { createApp };