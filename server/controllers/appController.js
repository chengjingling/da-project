const connection = require("../config/database");
const transporter = require("../config/mail");

const retrieveApps = (req, res) => {
    connection.beginTransaction();

    connection.query("SELECT * FROM applications", (err, apps) => {
        if (err) {
            console.error("Error selecting applications:", err);
            connection.rollback();
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            connection.commit();
            res.status(200).json({ apps: apps });
        }
    });
};

const createApp = (req, res) => {
    const data = req.body;

    const acronymRegex = /^[a-zA-Z0-9]+$/;

    if (data.app_acronym === "") {
        return res.status(400).json({ message: "Acronym cannot be blank." });
    }

    if (data.app_acronym.length > 50) {
        return res.status(400).json({ message: "Acronym cannot be more than 50 characters." });
    }

    if (!acronymRegex.test(data.app_acronym)) {
        return res.status(400).json({ message: "Acronym can only contain letters and numbers." });
    }

    if (data.app_rNumber === "") {
        return res.status(400).json({ message: "R. number cannot be blank." });
    }

    if (!Number.isInteger(Number(data.app_rNumber))) {
        return res.status(400).json({ message: "R. number must be an integer." });
    }

    if (data.app_rNumber < 0) {
        return res.status(400).json({ message: "R. number cannot be less than 0." });
    }

    connection.beginTransaction();

    connection.query("INSERT INTO applications SET ?", data, (err) => {
        if (err) {
            connection.rollback();
            
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).json({ message: "Acronym already exists." });
            } else {
                console.error("Error inserting application:", err);
                res.status(500).json({ message: "An error occurred, please try again." });
            }
        } else {
            connection.commit();
            res.status(201).json({ message: "Application created." });
        }
    });
};

const updateApp = (req, res) => {
    const data = req.body;

    connection.beginTransaction();

    connection.query("UPDATE applications SET app_description = ?, app_startDate = ?, app_endDate = ?, app_permitCreate = ?, app_permitOpen = ?, app_permitToDoList = ?, app_permitDoing = ?, app_permitDone = ? WHERE app_acronym = ?", [data.app_description, data.app_startDate, data.app_endDate, data.app_permitCreate, data.app_permitOpen, data.app_permitToDoList, data.app_permitDoing, data.app_permitDone, data.app_acronym], (err) => {
        if (err) {
            console.error("Error updating application:", err);
            connection.rollback();
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            connection.commit();
            res.status(200).json({ message: "Application updated." });
        }
    });
};

const retrievePlans = (req, res) => {
    const { appAcronym } = req.query;
    
    connection.beginTransaction();

    connection.query("SELECT * FROM plans WHERE plan_appAcronym = ?", [appAcronym], (err, plans) => {
        if (err) {
            console.error("Error selecting plans:", err);
            connection.rollback();
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            connection.commit();
            res.status(200).json({ plans: plans });
        }
    });
};

const createPlan = (req, res) => {
    const data = req.body;

    const mvpNameRegex = /^[a-zA-Z0-9 ]+$/;
    
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

    connection.beginTransaction();

    connection.query("INSERT INTO plans SET ?", data, (err) => {
        if (err) {
            connection.rollback();

            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).json({ message: "MVP name already exists." });
            } else {
                console.error("Error inserting plan:", err);
                res.status(500).json({ message: "An error occurred, please try again." });
            }
        } else {
            connection.commit();
            res.status(201).json({ message: "Plan created." });
        }
    });
};

const retrieveTasks = (req, res) => {
    const { appAcronym } = req.query;
    
    connection.beginTransaction();

    connection.query("SELECT * FROM tasks WHERE task_appAcronym = ?", [appAcronym], (err, tasks) => {
        if (err) {
            console.error("Error selecting tasks:", err);
            connection.rollback();
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            connection.commit();
            res.status(200).json({ tasks: tasks });
        }
    });
};

const retrieveTask = (req, res) => {
    const { taskId } = req.query;
    
    connection.beginTransaction();

    connection.query("SELECT * FROM tasks WHERE task_id = ?", [taskId], (err, tasks) => {
        if (err) {
            console.error("Error selecting task:", err);
            connection.rollback();
            res.status(500).json({ message: "An error occurred, please try again." });
        } else {
            connection.commit();
            res.status(200).json({ task: tasks[0] });
        }
    });
};

const createTask = async (req, res) => {
    const data = req.body;

    const nameRegex = /^[a-zA-Z0-9 ]+$/;
    
    if (data.task_name === "") {
        return res.status(400).json({ message: "Name cannot be blank." });
    }

    if (data.task_name.length > 50) {
        return res.status(400).json({ message: "Name cannot be more than 50 characters." });
    }

    if (!nameRegex.test(data.task_name)) {
        return res.status(400).json({ message: "Name can only contain letters, numbers and spaces." });
    }

    try {
        connection.beginTransaction();
    
        const lastRNumberResult = await connection.promise().query(
            "SELECT MAX(SUBSTRING(task_id, LENGTH(task_appAcronym) + 2)) AS lastRNumber FROM tasks WHERE task_appAcronym = ?",
            [data.task_appAcronym]
        );
        
        const lastRNumber = lastRNumberResult[0][0].lastRNumber;
        
        if (lastRNumber) {
            if (lastRNumber === "2147483647") {
                return res.status(400).json({ message: "R. number exceeded, cannot create any more tasks." });
            } else {
                data.task_id = data.task_appAcronym + "_" + (parseInt(lastRNumber) + 1).toString();
            }
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

        data.task_notes = "";
        data.task_state = "Open";
        data.task_creator = req.user.username;
        data.task_owner = req.user.username;
        data.task_createDate = new Date();
        
        await connection.promise().query(
            "INSERT INTO tasks SET ?", 
            data
        );

        connection.commit();
        res.status(201).json({ message: "Task created." });
    } catch (err) {
        console.error("Error creating task:", err);
        connection.rollback();
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

const updateTaskNotes = async (req, res) => {
    const data = req.body;

    try {
        connection.beginTransaction();
    
        const [userGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE user_group_username = ?", 
            [req.user.username]
        );
        
        const userGroups = userGroupsResults.map(group => group.user_group_groupName);

        const [appPermitsResults] = await connection.promise().query(
            "SELECT * FROM applications WHERE app_acronym = ?", 
            [data.appAcronym]
        );

        const appPermits = {
            "Create": appPermitsResults[0].app_permitCreate,
            "Open": appPermitsResults[0].app_permitOpen,
            "To-do": appPermitsResults[0].app_permitToDoList,
            "Doing": appPermitsResults[0].app_permitDoing,
            "Done": appPermitsResults[0].app_permitDone
        };
        
        const permits = Object.entries(appPermits)
            .filter(([key, value]) => userGroups.includes(value))
            .map(([key, value]) => key);
    
        const [taskResults] = await connection.promise().query(
            "SELECT * FROM tasks WHERE task_id = ?",
            [data.task_id]
        );

        if (permits.includes(taskResults[0].task_state)) {
            let notes = taskResults[0].task_notes;
        
            if (notes !== "") {
                notes += ", ";
            }

            const obj = {
                text: data.note,
                date_posted: new Date(),
                creator: req.user.username,
                type: "written"
            }

            const objString = JSON.stringify(obj);

            notes += objString;

            await connection.promise().query(
                "UPDATE tasks SET task_notes = ?, task_owner = ? WHERE task_id = ?", 
                [notes, req.user.username, data.task_id]
            );

            connection.commit();
            res.status(200).json({ message: "Task notes updated." });
        } else {
            connection.rollback();
            res.status(403).json({ message: "You are not permitted to perform this action." });
        }
    } catch (err) {
        console.error("Error updating task notes:", err);
        connection.rollback();
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

const updateTaskPlan = async (req, res) => {
    const data = req.body;

    try {
        connection.beginTransaction();
    
        const [userGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE user_group_username = ?", 
            [req.user.username]
        );
        
        const userGroups = userGroupsResults.map(group => group.user_group_groupName);

        const [appPermitsResults] = await connection.promise().query(
            "SELECT * FROM applications WHERE app_acronym = ?", 
            [data.appAcronym]
        );

        const appPermits = {
            "Create": appPermitsResults[0].app_permitCreate,
            "Open": appPermitsResults[0].app_permitOpen,
            "To-do": appPermitsResults[0].app_permitToDoList,
            "Doing": appPermitsResults[0].app_permitDoing,
            "Done": appPermitsResults[0].app_permitDone
        };
        
        const permits = Object.entries(appPermits)
            .filter(([key, value]) => userGroups.includes(value))
            .map(([key, value]) => key);
    
        const [taskResults] = await connection.promise().query(
            "SELECT * FROM tasks WHERE task_id = ?",
            [data.task_id]
        );
        
        if ((taskResults[0].task_state === "Open" && permits.includes("Open")) ||
            (taskResults[0].task_state === "Done" && permits.includes("Done") && data.buttonPressed === "Reject task")) {
            if (taskResults[0].task_plan !== data.task_plan) {
                let notes = taskResults[0].task_notes;
            
                if (notes !== "") {
                    notes += ", ";
                }

                notes += `{"text": "Plan changed from ${taskResults[0].task_plan} to ${data.task_plan}", "date_posted": "${new Date()}", "creator": "~system~", "type": "system"}`;

                await connection.promise().query(
                    "UPDATE tasks SET task_plan = ?, task_notes = ?, task_owner = ? WHERE task_id = ?", 
                    [data.task_plan, notes, req.user.username, data.task_id]
                );
            }

            connection.commit();
            res.status(200).json({ message: "Task plan updated." });
        } else {
            connection.rollback();
            res.status(403).json({ message: "You are not permitted to perform this action." });
        }
    } catch (err) {
        console.error("Error updating task plan:", err);
        connection.rollback();
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

const updateTaskState = async (req, res) => {
    const data = req.body;

    let newState;
    let message;
    
    if (data.buttonPressed === "Release task") {
        newState = "To-do";
        message = "Task released";
    } else if (data.buttonPressed === "Work on task") {
        newState = "Doing";
        message = "Working on task";
    } else if (data.buttonPressed === "Return task to to-do list") {
        newState = "To-do";
        message = "Task returned to to-do list";
    } else if (data.buttonPressed === "Seek approval") {
        newState = "Done";
        message = "Seeking approval";
    } else if (data.buttonPressed === "Request for deadline extension") {
        newState = "Done";
        message = "Requesting for deadline extension";
    } else if (data.buttonPressed === "Reject task") {
        newState = "Doing";
        message = "Task rejected";
    } else if (data.buttonPressed === "Approve task") {
        newState = "Closed";
        message = "Task approved";
    }

    try {
        connection.beginTransaction();
    
        const [userGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE user_group_username = ?", 
            [req.user.username]
        );
        
        const userGroups = userGroupsResults.map(group => group.user_group_groupName);

        const [appPermitsResults] = await connection.promise().query(
            "SELECT * FROM applications WHERE app_acronym = ?", 
            [data.appAcronym]
        );

        const appPermits = {
            "Create": appPermitsResults[0].app_permitCreate,
            "Open": appPermitsResults[0].app_permitOpen,
            "To-do": appPermitsResults[0].app_permitToDoList,
            "Doing": appPermitsResults[0].app_permitDoing,
            "Done": appPermitsResults[0].app_permitDone
        };
        
        const permits = Object.entries(appPermits)
            .filter(([key, value]) => userGroups.includes(value))
            .map(([key, value]) => key);
    
        const [taskResults] = await connection.promise().query(
            "SELECT * FROM tasks WHERE task_id = ?",
            [data.task_id]
        );

        if (permits.includes(taskResults[0].task_state)) {
            let notes = taskResults[0].task_notes;
            let oldState = taskResults[0].task_state;
            
            if (notes !== "") {
                notes += ", ";
            }

            notes += `{"text": "${oldState} >> ${newState} (${message})", "date_posted": "${new Date()}", "creator": "~system~", "type": "system"}`;

            await connection.promise().query(
                "UPDATE tasks SET task_notes = ?, task_state = ?, task_owner = ? WHERE task_id = ?", 
                [notes, newState, req.user.username, data.task_id]
            );

            if (data.buttonPressed === "Seek approval" || data.buttonPressed === "Request for deadline extension") {
                const [appResults] = await connection.promise().query(
                    "SELECT * FROM applications WHERE app_acronym = ?",
                    [data.appAcronym]
                );

                const [userGroupsResults] = await connection.promise().query(
                    "SELECT * FROM user_group WHERE user_group_groupName = ?",
                    [appResults[0].app_permitDone]
                );

                const [usersResults] = await connection.promise().query(
                    `SELECT * FROM users WHERE user_username IN (${userGroupsResults.map(userGroup => "'" + userGroup.user_group_username + "'").join(", ")}) AND user_enabled = true`
                );

                const emailsString = usersResults.map(user => user.user_email).join(", ");
                
                if (emailsString !== "") {
                    await transporter.sendMail({
                        from: '"Cheng Jingling" <chengjingling@gmail.com>',
                        to: emailsString,
                        subject: `${data.task_id} in ${data.appAcronym} ready for review`,
                        html: `<p>${data.task_id} in ${data.appAcronym} ready for review</p>`,
                    });
                }
            }

            connection.commit();
            res.status(200).json({ message: "Task state updated." });
        } else {
            connection.rollback();
            res.status(403).json({ message: "You are not permitted to perform this action." });
        }
    } catch (err) {
        console.error("Error updating task state:", err);
        connection.rollback();
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

module.exports = { retrieveApps, createApp, updateApp, retrievePlans, createPlan, retrieveTasks, retrieveTask, createTask, updateTaskNotes, updateTaskPlan, updateTaskState };