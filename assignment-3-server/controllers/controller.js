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
        res.status(500).json({ message: "An error occurred, please try again." });
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
        return isMatch;
    } catch (err) {
        console.error("Error checking credentials:", err);
        throw err;
    }
};

const createTask = async (req, res) => {
    try {
        connection.beginTransaction();
        
        const { task_app_acronym, task_name, task_description, task_plan, username, password } = req.body;

        // PAYLOAD ERRORS 

        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing task application acronym' });
        }

        if (!task_name || typeof task_name !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing task name' });
        }

        if (task_plan && typeof task_plan !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid task plan' });
        }

        if (task_description && typeof task_description !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid task description' });
        }

        const nameRegex = /^[a-zA-Z0-9 ]{1,50}$/;
        const planRegex = /^[a-zA-Z0-9_ -]{1,50}$/;

        if (!nameRegex.test(task_name)) {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid task name format' });
        }

        if (task_plan && !planRegex.test(task_plan)) {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid task plan format' });
        }

        if (task_description && task_description.length > 65535) {
            connection.rollback();
            return res.status(400).json({ message: 'Task description too long' });
        }

        if (!username || typeof username !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing username' });
        }

        if (!password || typeof password !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing password' });
        }

        // IAM ERRORS

        const isMatch = await checkCredentials(username, password);

        if (!isMatch) {
            connection.rollback();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!(await checkAppPermit(username, "CREATE", task_app_acronym))) {
            connection.rollback();
            return res.status(403).json({ message: "Forbidden: No Create Permission" });
        }

        // TRANSACTION ERRORS

        const [app_r_number] = await connection.promise().query("SELECT app_rNumber FROM applications WHERE app_acronym = ?", [task_app_acronym]);

        if (app_r_number.length === 0) {
            connection.rollback();
            return res.status(400).json({ message: "Application not found" });
        }        
        
        if (task_plan) {
            const [plan] = await connection.promise().query("SELECT * FROM plans WHERE plan_mvpName = ? AND plan_appAcronym = ?", [task_plan, task_app_acronym]);

            if (plan.length === 0) {
                connection.rollback();
                return res.status(400).json({ message: "Task plan not found" });
            }
        }

        const app_r_number_value = app_r_number[0].app_rNumber;

        if (app_r_number_value === 2147483647) {
            connection.rollback();
            return res.status(400).json({ message: "Max App_Rnumber reached" });
        }

        const task_id = `${task_app_acronym}_${app_r_number_value}`;

        const task_creator = username;
        const task_createDate = new Date();
        const task_state = "OPEN";

        await connection.promise().query("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [task_id, task_app_acronym, task_plan || null, task_name, task_description || null, "", task_state, task_creator, task_creator, task_createDate]);

        const new_r_number = app_r_number_value + 1;
        await connection.promise().query("UPDATE applications SET app_rNumber = ? WHERE app_acronym = ?", [new_r_number, task_app_acronym]);

        connection.commit();
        res.json({ message: "Task created successfully" });
    } catch (err) {
        connection.rollback();
        console.error("Error creating task:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
};

const getTaskbyState = async (req, res) => {
    try {
        const { username, password, task_app_acronym, state } = req.body;

        if (!state || typeof state !== 'string' || !['OPEN', 'TODO', 'DOING', 'DONE', 'CLOSED'].includes(state.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid or missing task state' });
        }

        if (!task_app_acronym || typeof task_app_acronym !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing task application acronym' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing username' });
        }

        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing password' });
        }

        const isMatch = await checkCredentials(username, password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const [tasks] = await connection.promise().query("SELECT * FROM tasks WHERE task_state = ? AND task_appAcronym = ?", [state, task_app_acronym]);
        
        res.json(tasks);
    } catch (err) {
        console.error("Error getting tasks by state:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    } 
};

const promoteTask2Done = async (req, res) => {
    try {
        connection.beginTransaction();

        const { username, password, task_id, notes } = req.body;

        if (!task_id || typeof task_id !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing task id' });
        }

        if (notes && typeof notes !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid notes' });
        }

        if (notes && notes.length > 65535) {
            connection.rollback();
            return res.status(400).json({ message: 'Notes too long' });
        }

        if (!username || typeof username !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing username' });
        }

        if (!password || typeof password !== 'string') {
            connection.rollback();
            return res.status(400).json({ message: 'Invalid or missing password' });
        }
        
        const isMatch = await checkCredentials(username, password);

        if (!isMatch) {
            connection.rollback();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const [task] = await connection.promise().query("SELECT * FROM tasks WHERE task_id = ?", [task_id]);

        if (task.length === 0) {
            connection.rollback();
            return res.status(400).json({ message: "Task not found" });
        }

        const task_state = task[0].task_state;

        if (task_state !== "DOING") {
            connection.rollback();
            return res.status(400).json({ message: "Task not in DOING state" });
        }

        let allNotes = task[0].task_notes;
        
        if (notes !== "") {
            if (allNotes !== "") {
                allNotes += ", ";
            }

            const obj = {
                text: notes,
                date_posted: new Date(),
                creator: username,
                type: "written"
            }

            const objString = JSON.stringify(obj);

            allNotes += objString;
        }

        const task_app_acronym = task[0].task_appAcronym;

        if (!(await checkAppPermit(username, "DONE", task_app_acronym))) {
            connection.rollback();
            return res.status(403).json({ message: "Forbidden" });
        }

        await connection.promise().query("UPDATE tasks SET task_state = 'DONE', task_notes = ? WHERE task_id = ?", [allNotes, task_id]);

        const [appResults] = await connection.promise().query("SELECT * FROM applications WHERE app_acronym = ?", [task_app_acronym]);

        const [userGroupsResults] = await connection.promise().query("SELECT * FROM user_group WHERE user_group_groupName = ?", [appResults[0].app_permitDone]);

        const [usersResults] = await connection.promise().query(`SELECT * FROM users WHERE user_username IN (${userGroupsResults.map(userGroup => "'" + userGroup.user_group_username + "'").join(", ")}) AND user_enabled = true`);

        const emailsString = usersResults.map(user => user.user_email).join(", ");
        
        if (emailsString !== "") {
            await transporter.sendMail({
                from: '"Cheng Jingling" <chengjingling@gmail.com>',
                to: emailsString,
                subject: `${task_id} in ${task_app_acronym} ready for review`,
                html: `<p>${task_id} in ${task_app_acronym} ready for review</p>`,
            });
        }

        connection.commit();
        res.json({ message: "Task promoted to DONE state" });
    } catch (err) {
        connection.rollback();
        console.error("Error promoting task to DONE:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
};

module.exports = { createTask, getTaskbyState, promoteTask2Done };