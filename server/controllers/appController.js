const connection = require("../config/database");

const createApp = (req, res) => {
    connection.query("INSERT INTO applications SET ?", req.body, (err) => {
        if (err) {
            res.status(500).json({ message: err });
        } else {
            res.status(201).json({ message: "application created" });
        }
    });
};

module.exports = { createApp };