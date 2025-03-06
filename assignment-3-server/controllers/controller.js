const connection = require("../config/database");
const transporter = require("../config/mail");
const bcrypt = require("bcryptjs");

const checkAppPermit = async (username, state, appid) => {
    try {
        const [userGroupsResults] = await connection.promise().query("SELECT * FROM user_group WHERE user_group_username = ?", [username]);
        const userGroups = userGroupsResults.map(group => group.user_group_groupName);

        const [appPermitsResults] = await connection.promise().query("SELECT * FROM applications WHERE app_acronym = ?", [appid]);

        const appPermits = {
            "CREATE": appPermitsResults[0].app_permitCreate,
            "OPEN": appPermitsResults[0].app_permitOpen,
            "TODO": appPermitsResults[0].app_permitToDoList,
            "DOING": appPermitsResults[0].app_permitDoing,
            "DONE": appPermitsResults[0].app_permitDone
        };
        
        const permits = Object.entries(appPermits)
            .filter(([key, value]) => userGroups.includes(value))
            .map(([key, value]) => key);

        return permits.includes(state);
    } catch (err) {
        console.error("Error checking permits:", err);
        throw err;
    }
};

const checkCredentials = async (username, password) => {
    try {
        const [users] = await connection.promise().query("SELECT * FROM users WHERE user_username = ?", [username]);

        if (users.length === 0) {
            return false;
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.user_password);
        return isMatch && user.user_enabled;
    } catch (err) {
        console.error("Error checking credentials:", err);
        throw err;
    }
};

const createTask = async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        return res.status(400).json({ code: "E1002" });
    }

    try {
        connection.beginTransaction();
        
        const { task_app_acronym, task_name, task_description, task_plan, username, password } = req.body;

        const nameRegex = /^[a-zA-Z0-9 ]{1,50}$/;

        if (!username || typeof username !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2001" });
        }

        if (!password || typeof password !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2002" });
        }

        if (!task_name || typeof task_name !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2003" });
        }

        if (!nameRegex.test(task_name)) {
            connection.rollback();
            return res.status(400).json({ code: "E2003" });
        }

        if (!task_app_acronym || typeof task_app_acronym !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2004" });
        }

        if (task_plan && typeof task_plan !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2005" });
        }

        if (task_description && typeof task_description !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2006" });
        }

        if (task_description && task_description.length > 65535) {
            connection.rollback();
            return res.status(400).json({ code: "E2006" });
        }

        const validCredentials = await checkCredentials(username, password);

        if (!validCredentials) {
            connection.rollback();
            return res.status(400).json({ code: "E3001" });
        }

        const [app_r_number] = await connection.promise().query("SELECT app_rNumber FROM applications WHERE app_acronym = ?", [task_app_acronym]);

        if (app_r_number.length === 0) {
            connection.rollback();
            return res.status(400).json({ code: "E3002" });
        }

        if (!(await checkAppPermit(username, "CREATE", task_app_acronym))) {
            connection.rollback();
            return res.status(400).json({ code: "E3002" });
        }    
        
        if (task_plan) {
            const [plan] = await connection.promise().query("SELECT * FROM plans WHERE plan_mvpName = ? AND plan_appAcronym = ?", [task_plan, task_app_acronym]);

            if (plan.length === 0) {
                connection.rollback();
                return res.status(400).json({ code: "E4001" });
            }
        }

        const app_r_number_value = app_r_number[0].app_rNumber;

        if (app_r_number_value === 2147483647) {
            connection.rollback();
            return res.status(400).json({ code: "E4003" });
        }

        const task_id = `${task_app_acronym}_${app_r_number_value}`;

        const auditObject = {
            text: "Created task",
            date_posted: new Date(),
            creator: "~system~",
            type: "system",
            state: "Open"
        };

        const auditString = JSON.stringify(auditObject);

        const task_creator = username;
        const task_createDate = new Date();
        const task_state = "OPEN";

        await connection.promise().query("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [task_id, task_app_acronym, task_plan || null, task_name, task_description || null, auditString, task_state, task_creator, task_creator, task_createDate]);

        const new_r_number = app_r_number_value + 1;
        await connection.promise().query("UPDATE applications SET app_rNumber = ? WHERE app_acronym = ?", [new_r_number, task_app_acronym]);

        connection.commit();
        res.status(200).json({ code: "S0001", task_id: task_id });
    } catch (err) {
        connection.rollback();
        console.error("Error creating task:", err);
        res.status(400).json({ code: "E5001" });
    }
};

const getTaskbyState = async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        return res.status(400).json({ code: "E1002" });
    }

    try {
        const { username, password, task_app_acronym, task_state } = req.body;

        if (!username || typeof username !== "string") {
            return res.status(400).json({ code: "E2001" });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({ code: "E2002" });
        }

        if (!task_app_acronym || typeof task_app_acronym !== "string") {
            return res.status(400).json({ code: "E2004" });
        }

        if (!task_state || typeof task_state !== "string" || !["OPEN", "TODO", "DOING", "DONE", "CLOSED"].includes(task_state.toUpperCase())) {
            return res.status(400).json({ code: "E2008" });
        }

        const validCredentials = await checkCredentials(username, password);

        if (!validCredentials) {
            return res.status(400).json({ code: "E3001" });
        }

        let state = task_state;

        if (state.toUpperCase() === "TODO") {
            state = "To-do";
        }

        const [tasks] = await connection.promise().query("SELECT * FROM tasks WHERE task_state = ? AND task_appAcronym = ?", [state, task_app_acronym]);

        res.status(200).json({ code: "S0001", tasks: tasks });
    } catch (err) {
        console.error("Error getting tasks by state:", err);
        res.status(400).json({ code: "E5001" });
    } 
};

const promoteTask2Done = async (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        return res.status(400).json({ code: "E1002" });
    }

    try {
        connection.beginTransaction();

        const { username, password, task_id, task_notes } = req.body;

        if (!username || typeof username !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2001" });
        }

        if (!password || typeof password !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2002" });
        }

        if (!task_id || typeof task_id !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2007" });
        }

        if (task_notes && typeof task_notes !== "string") {
            connection.rollback();
            return res.status(400).json({ code: "E2009" });
        }

        const validCredentials = await checkCredentials(username, password);

        if (!validCredentials) {
            connection.rollback();
            return res.status(400).json({ code: "E3001" });
        }

        const [task] = await connection.promise().query("SELECT * FROM tasks WHERE task_id = ?", [task_id]);

        if (task.length === 0) {
            connection.rollback();
            return res.status(400).json({ code: "E3002" });
        }

        const task_app_acronym = task[0].task_appAcronym;

        if (!(await checkAppPermit(username, "DOING", task_app_acronym))) {
            connection.rollback();
            return res.status(400).json({ code: "E3002" });
        }

        const task_state = task[0].task_state;

        if (task_state !== "Doing") {
            connection.rollback();
            return res.status(400).json({ code: "E4002" });
        }

        let allNotes = task[0].task_notes;
        
        if (task_notes !== "") {
            const notesObject = {
                text: task_notes,
                date_posted: new Date(),
                creator: username,
                type: "written",
                state: "Doing"
            };

            const notesString = JSON.stringify(notesObject);

            allNotes += ", " + notesString;
        }

        const auditObject = {
            text: "Doing >> Done",
            date_posted: new Date(),
            creator: "~system~",
            type: "system",
            state: "Doing"
        };

        const auditString = JSON.stringify(auditObject);

        allNotes += ", " + auditString;

        if (allNotes.length > 4294967295) {
            return res.status(400).json({ code: "E4004" });
        }

        await connection.promise().query("UPDATE tasks SET task_state = 'DONE', task_notes = ? WHERE task_id = ?", [allNotes, task_id]);

        const [appResults] = await connection.promise().query("SELECT * FROM applications WHERE app_acronym = ?", [task_app_acronym]);

        const [userGroupsResults] = await connection.promise().query("SELECT * FROM user_group WHERE user_group_groupName = ?", [appResults[0].app_permitDone]);

        const [usersResults] = await connection.promise().query(`SELECT * FROM users WHERE user_username IN (${userGroupsResults.map(userGroup => "'" + userGroup.user_group_username + "'").join(", ")}) AND user_enabled = true`);

        const emailsString = usersResults.map(user => user.user_email).join(", ");
        
        let message = {
            from: '"Cheng Jingling" <chengjingling@gmail.com>',
            to: emailsString,
            subject: `${task_id} in ${task_app_acronym} ready for review`,
            html: `<p>${task_id} in ${task_app_acronym} ready for review</p>`,
        };

        if (emailsString !== "") {
            transporter.sendMail(message, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                    return null;
                }
            });
        }

        connection.commit();
        res.status(200).json({ code: "S0001" });
    } catch (err) {
        connection.rollback();
        console.error("Error promoting task to DONE:", err);
        res.status(400).json({ code: "E5001" });
    }
};

module.exports = { createTask, getTaskbyState, promoteTask2Done };