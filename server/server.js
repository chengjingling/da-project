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
const { checkGroup } = require("./middleware/checkGroup");

const authenticateUser = require("./routes/authenticateUser");
app.use("/api", authenticateUser);

const retrieveUsers = require("./routes/retrieveUsers");
app.use("/api", validateToken, checkGroup, retrieveUsers);

const retrieveGroups = require("./routes/retrieveGroups");
app.use("/api", validateToken, checkGroup, retrieveGroups);

const createGroup = require("./routes/createGroup");
app.use("/api", validateToken, checkGroup, createGroup);

app.listen(8080, () => {
    console.log("Server started on port 8080");
});