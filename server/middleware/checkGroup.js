const connection = require("../config/database");

const checkGroup = (username, groupName) => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM user_group WHERE username = ? AND groupName = ?", [username, groupName], (err, result) => {
            if (err) {
                console.error("Error selecting user_group:", err);
                reject(err);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

const i_checkGroup = async (req, res, next) => {
    const isAdmin = await checkGroup(req.user.username, "admin");
    
    if (isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "not admin" });
    }
};

module.exports = { i_checkGroup };