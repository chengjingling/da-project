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

connection.query("CREATE TABLE applications (app_acronym VARCHAR(20), app_rNumber INT NOT NULL, app_description VARCHAR(1000), app_startDate DATE, app_endDate DATE, app_permitCreate VARCHAR(50), app_permitOpen VARCHAR(50), app_permitToDoList VARCHAR(50), app_permitDoing VARCHAR(50), app_permitDone VARCHAR(50), PRIMARY KEY (app_acronym))", (err, result) => {
    if (err) {
        console.error("Error creating applications table:", err);
    } else {
        console.log("applications table created");
    }
});

connection.query("CREATE TABLE plans (plan_appAcronym VARCHAR(20) NOT NULL, plan_mvpName VARCHAR(50), plan_startDate DATE, plan_endDate DATE, plan_color VARCHAR(7), PRIMARY KEY (plan_appAcronym, plan_mvpName), FOREIGN KEY (plan_appAcronym) REFERENCES applications(app_acronym))", (err, result) => {
    if (err) {
        console.error("Error creating plans table:", err);
    } else {
        console.log("plans table created");
    }
});

connection.query("CREATE TABLE tasks (task_id VARCHAR(31), task_appAcronym VARCHAR(20) NOT NULL, task_plan VARCHAR(50), task_name VARCHAR(50) NOT NULL, task_description TEXT NOT NULL, task_notes LONGTEXT, task_state ENUM('Open', 'To-do', 'Doing', 'Done', 'Closed'), task_creator VARCHAR(50) NOT NULL, task_owner VARCHAR(50), task_createDate DATETIME NOT NULL, PRIMARY KEY (task_id), FOREIGN KEY (task_appAcronym) REFERENCES applications(app_acronym), FOREIGN KEY (task_appAcronym, task_plan) REFERENCES plans(plan_appAcronym, plan_mvpName))", (err, result) => {
    if (err) {
        console.error("Error creating tasks table:", err);
    } else {
        console.log("tasks table created");
    }
});

process.exit();