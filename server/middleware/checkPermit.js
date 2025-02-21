const connection = require("../config/database");
const { checkGroup } = require("./checkGroup");

const checkPermit = async (req, res, next) => {
    const data = req.body;

    let appAcronym;

    if (req.route.path === "/createTask") {
        appAcronym = data.task_appAcronym;
    } else {
        appAcronym = data.appAcronym;
    }

    const [appResults] = await connection.promise().query(
        "SELECT * FROM applications WHERE app_acronym = ?", 
        [appAcronym]
    );

    const app = appResults[0];

    let state;

    if (req.route.path === "/createTask") {
        state = "Create";
    } else {
        const [taskResults] = await connection.promise().query(
            "SELECT * FROM tasks WHERE task_id = ?",
            [data.task_id]
        );
        
        state = taskResults[0].task_state;
    }

    let permitToCheck;

    if (state === "Create") {
        permitToCheck = app.app_permitCreate;
    } else if (state === "Open") {
        permitToCheck = app.app_permitOpen;
    } else if (state === "To-do") {
        permitToCheck = app.app_permitToDoList;
    } else if (state === "Doing") {
        permitToCheck = app.app_permitDoing;
    } else if (state === "Done") {
        permitToCheck = app.app_permitDone;
    }
    
    const userHasPermission = await checkGroup(req.user.username, permitToCheck);
        
    if (userHasPermission) {
        next();
    } else {
        res.status(403).json({ message: "You are not permitted to perform this action." });
    }
};

module.exports = { checkPermit };