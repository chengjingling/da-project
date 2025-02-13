const connection = require("../config/database");

const retrieveApps = (req, res) => {
    connection.query("SELECT * FROM applications", (err, apps) => {
        if (err) {
            console.error("Error selecting applications:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ apps: apps });
        }
    });
};

const createApp = (req, res) => {
    const data = req.body;

    if (data.app_acronym ==="") {
        return res.status(400).json({ message: "Acronym cannot be blank." });
    }

    connection.query("INSERT INTO applications SET ?", data, (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).json({ message: "Acronym already exists." });
            } else if (err.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
                res.status(400).json({ message: "R. number must be an integer." });
            } else {
                console.error("Error inserting application:". err);
                res.status(500).json({ message: "An error occurred, please try again." });
            }
        } else {
            res.status(201).json({ message: "Application created." });
        }
    });
};

const updateApp = (req, res) => {
    const data = req.body;

    connection.query("UPDATE applications SET app_description = ?, app_startDate = ?, app_endDate = ?, app_permitCreate = ?, app_permitOpen = ?, app_permitToDoList = ?, app_permitDoing = ?, app_permitDone = ? WHERE app_acronym = ?", [data.app_description, data.app_startDate, data.app_endDate, data.app_permitCreate, data.app_permitOpen, data.app_permitToDoList, data.app_permitDoing, data.app_permitDone, data.app_acronym], (err) => {
        if (err) {
            console.error("Error updating application:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ message: "Application updated." });
        }
    });
};

module.exports = { retrieveApps, createApp, updateApp };