const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true
};
app.use(cors(corsOptions));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const connection = require("./config/database");

const { validateToken } = require("./middleware/validateToken");
const { i_checkGroup } = require("./middleware/checkGroup");

const login = require("./routes/login");
app.use("/api", login);

const checkToken = require("./auth/checkToken");
app.use("/api", checkToken);

const checkPermission = require("./auth/checkPermission");
app.use("/api", validateToken, checkPermission);

const logout = require("./routes/logout");
app.use("/api", validateToken, logout);

const retrieveUserGroups = require("./routes/retrieveUserGroups");
app.use("/api", validateToken, retrieveUserGroups);

const retrieveUsers = require("./routes/retrieveUsers");
app.use("/api", validateToken, i_checkGroup, retrieveUsers);

const createUser = require("./routes/createUser");
app.use("/api", validateToken, i_checkGroup, createUser);

const updateUser = require("./routes/updateUser");
app.use("/api", validateToken, i_checkGroup, updateUser);

const retrieveGroups = require("./routes/retrieveGroups");
app.use("/api", validateToken, i_checkGroup, retrieveGroups);

const createGroup = require("./routes/createGroup");
app.use("/api", validateToken, i_checkGroup, createGroup);

app.listen(8080, () => {
    console.log("Server started on port 8080");
});