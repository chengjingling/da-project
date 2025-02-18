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

    if (data.app_acronym === "") {
        return res.status(400).json({ message: "Acronym cannot be blank." });
    }

    if (data.app_acronym.length > 50) {
        return res.status(400).json({ message: "Acronym cannot be more than 50 characters." });
    }

    connection.query("INSERT INTO applications SET ?", data, (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).json({ message: "Acronym already exists." });
            } else if (err.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
                res.status(400).json({ message: "R. number must be an integer." });
            } else {
                console.error("Error inserting application:", err);
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

const retrievePlans = (req, res) => {
    const { appAcronym } = req.query;
    
    connection.query("SELECT * FROM plans WHERE plan_appAcronym = ?", [appAcronym], (err, plans) => {
        if (err) {
            console.error("Error selecting plans:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ plans: plans });
        }
    });
};

const createPlan = (req, res) => {
    const data = req.body;

    const mvpNameRegex = /^[a-zA-Z0-9 ]*$/;
    
    if (data.plan_mvpName === "") {
        return res.status(400).json({ message: "MVP name cannot be blank." });
    }

    if (data.plan_mvpName.length > 50) {
        return res.status(400).json({ message: "MVP name cannot be more than 50 characters." });
    }

    if (!mvpNameRegex.test(data.plan_mvpName)) {
        return res.status(400).json({ message: "MVP name can only contain letters, numbers and spaces." });
    }

    const letters = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    data.plan_color = color;

    connection.query("INSERT INTO plans SET ?", data, (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).json({ message: "MVP name already exists." });
            } else {
                console.error("Error inserting plan:", err);
                res.status(500).json({ message: "An error occurred, please try again." });
            }
        } else {
            res.status(201).json({ message: "Plan created." });
        }
    });
};

const retrieveTasks = (req, res) => {
    const { appAcronym } = req.query;
    
    connection.query("SELECT * FROM tasks WHERE task_appAcronym = ?", [appAcronym], (err, tasks) => {
        if (err) {
            console.error("Error selecting tasks:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ tasks: tasks });
        }
    });
};

const retrieveTask = (req, res) => {
    const { taskId } = req.query;
    
    connection.query("SELECT * FROM tasks WHERE task_id = ?", [taskId], (err, tasks) => {
        if (err) {
            console.error("Error selecting task:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ task: tasks[0] });
        }
    });
};

const createTask = async (req, res) => {
    const data = req.body;
    
    if (data.task_name === "") {
        return res.status(400).json({ message: "Name cannot be blank." });
    }

    if (data.task_name.length > 50) {
        return res.status(400).json({ message: "Name cannot be more than 50 characters." });
    }

    try {
        const lastRNumberResult = await connection.promise().query(
            "SELECT MAX(SUBSTRING(task_id, LENGTH(task_appAcronym) + 2)) AS lastRNumber FROM tasks"
        );
        
        const lastRNumber = lastRNumberResult[0][0].lastRNumber;
        
        if (lastRNumber) {
            data.task_id = data.task_appAcronym + "_" + (parseInt(lastRNumber) + 1).toString();
        } else {
            const appResult = await connection.promise().query(
                "SELECT * FROM applications WHERE app_acronym = ?",
                [data.task_appAcronym]
            );
            
            data.task_id = data.task_appAcronym + "_" + appResult[0][0].app_rNumber;
        }

        if (data.task_plan === "") {
            delete data.task_plan;
        }

        data.task_state = "Open";
        data.task_creator = req.user.username;
        data.task_owner = req.user.username;
        data.task_createDate = new Date();
        
        await connection.promise().query(
            "INSERT INTO tasks SET ?", 
            data
        );
        
        res.status(201).json({ message: "Task created." });
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

const updateTask = (req, res) => {
    const data = req.body;
    
    if (data.note !== "") {
        if (data.task_notes !== "") {
            data.task_notes += ", ";
        }

        data.task_notes += `{"text": "${data.note}", "date_posted": "${new Date()}", "creator": "${req.user.username}", "type": "written"}`;
    }

    connection.query("UPDATE tasks SET task_plan = ?, task_notes = ? WHERE task_id = ?", [data.task_plan, data.task_notes, data.task_id], (err) => {
        if (err) {
            console.error("Error updating task:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            res.status(200).json({ message: "Task updated." });
        }
    });
};

module.exports = { retrieveApps, createApp, updateApp, retrievePlans, createPlan, retrieveTasks, retrieveTask, createTask, updateTask };