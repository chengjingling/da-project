const connection = require("../config/database");

const checkGroup = (username, groupName) => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM user_group WHERE user_group_username = ? AND user_group_groupName = ?", [username, groupName], (err, result) => {
            if (err) {
                console.error("Error selecting user_group:", err);
                reject(err);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

const i_checkGroup = (group) => {
    return async (req, res, next) => {
        const userInGroup = await checkGroup(req.user.username, group);
        
        if (userInGroup) {
            next();
        } else {
            res.status(403).json({ message: "No permission." });
        }
    };
};

module.exports = { checkGroup, i_checkGroup };