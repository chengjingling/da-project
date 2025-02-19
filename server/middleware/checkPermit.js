const connection = require("../config/database");
const { checkGroup } = require("./checkGroup");

const checkPermit = async (req, res, next) => {
    const data = req.body;

    const [taskResults] = await connection.promise().query(
        "SELECT * FROM tasks WHERE task_id = ?",
        [data.task_id]
    );

    const [appResults] = await connection.promise().query(
        "SELECT * FROM applications WHERE app_acronym = ?", 
        [data.appAcronym]
    );

    const state = taskResults[0].task_state;
    const app = appResults[0];
    let permitToCheck;

    if (state === "Open") {
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
        res.status(403).json({ message: "No permission." });
    }
};

module.exports = { checkPermit };