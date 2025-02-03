const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

const validateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(400);
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = { validateToken };