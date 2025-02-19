const connection = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const login = async (req, res) => {
    const { username, password } = req.body;
    let group;

    connection.query("SELECT * FROM user_group WHERE user_group_username = ? AND user_group_groupName = 'admin'", [username], async (err, result) => {
        if (err) {
            console.error("Error selecting user group:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else if (result.length === 0) {
            group = "user";
        } else {
            group = "admin";
        }
    });
    
    connection.query("SELECT * FROM users WHERE user_username = ?", [username], async (err, result) => {
        if (err) {
            console.error("Error selecting user:", err);
            res.status(500).json({ message: "An error occurred, please try again." });
        } else if (result.length === 0) {
            res.status(401).json({ message: "Username or password is incorrect." });
        } else {
            const hashedPassword = result[0].user_password;
            const isMatch = await bcrypt.compare(password, hashedPassword);
            
            if (isMatch) {
                if (!result[0].user_enabled) {
                    return res.status(403).json({ message: "Your account is disabled." });
                }

                const data = {
                    ipAddress: req.ip,
                    browserType: req.headers["user-agent"],
                    username: username
                };
            
                const token = jwt.sign(data, process.env.JWT_SECRET_KEY);
                
                res.cookie("token", token, { httpOnly: true });

                res.status(200).json({ token: token, group: group });
            } else {
                res.status(401).json({ message: "Username or password is incorrect." });
            }
        }
    });
};

const logout = async (req, res) => {
    res
    .clearCookie("token")
    .status(200)
    .json({ message: "Logged out." });
};

const checkToken = async (req, res) => {
    const token = req.cookies.token;

    if (token) {
        res.status(200).json({ token: token });
    } else {
        res.status(401).json({ token: "" });
    }
};

const checkIfAdmin = async (req, res) => {
    connection.query("SELECT * FROM user_group WHERE user_group_username = ? AND user_group_groupName = 'admin'", [req.user.username], (err, result) => {
        if (err) {
            console.error("Error selecting user_group:", err);
        } else {
            if (result.length > 0) {
                res.status(200).json({ isAdmin: true, username: req.user.username });
            } else {
                res.status(200).json({ isAdmin: false, username: req.user.username });
            }
        }
    });
};

const checkAccountStatus = async (req, res) => {
    connection.query("SELECT * FROM users WHERE user_username = ?", [req.user.username], (err, result) => {
        if (err) {
            console.error("Error selecting user:", err);
        } else {
            res.status(200).json({ isEnabled: result[0].user_enabled });
        }
    });
};

const checkPermits = async (req, res) => {
    try {
        const [userGroupsResults] = await connection.promise().query(
            "SELECT * FROM user_group WHERE user_group_username = ?", 
            [req.user.username]
        );
        
        const userGroups = userGroupsResults.map(group => group.user_group_groupName);

        const [appPermitsResults] = await connection.promise().query(
            "SELECT * FROM applications WHERE app_acronym = ?", 
            [req.query.appAcronym]
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
            [req.query.taskId]
        );

        const hasPermission = permits.includes(taskResults[0].task_state);

        res.status(200).json({ permits: permits, hasPermission: hasPermission });
    } catch (err) {
        console.error("Error checking permits:", err);
        res.status(500).json({ message: "An error occurred, please try again." });
    }
};

module.exports = { login, logout, checkToken, checkIfAdmin, checkAccountStatus, checkPermits };