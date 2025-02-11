const connection = require("../config/database");

connection.query("CREATE DATABASE da-project", (err, result) => {
    if (err) {
        console.error("Error creating da-project database:", err);
    } else {
        console.log("da-project database created");
    }
});

connection.query("USE da-project", (err, result) => {
    if (err) {
        console.error("Error using da-project database:", err);
    } else {
        console.log("da-project database used");
    }
});

connection.query("CREATE TABLE users (user_username VARCHAR(50), user_password VARCHAR(255) NOT NULL, user_email VARCHAR(100), user_enabled BOOLEAN DEFAULT TRUE NOT NULL, PRIMARY KEY (user_username))", (err, result) => {
    if (err) {
        console.error("Error creating users table:", err);
    } else {
        console.log("users table created");
    }
});

connection.query("CREATE TABLE user_group (user_group_username VARCHAR(50), user_group_groupName VARCHAR(50), PRIMARY KEY (user_group_username, user_group_groupName))", (err, result) => {
    if (err) {
        console.error("Error creating user_group table:", err);
    } else {
        console.log("user_group table created");
    }
});

connection.query("CREATE TABLE applications (app_acronym VARCHAR(20), app_description VARCHAR(1000), app_rNumber INT, app_startDate DATE, app_endDate DATE, app_permitCreate VARCHAR(50), app_permitOpen VARCHAR(50), app_permitToDoList VARCHAR(50), app_permitDoing VARCHAR(50), app_permitDone VARCHAR(50), PRIMARY KEY (app_acronym))", (err, result) => {
    if (err) {
        console.error("Error creating applications table:", err);
    } else {
        console.log("applications table created");
    }
});

process.exit();