const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};
app.use(cors(corsOptions));

const connection = require("./config/database");

const authenticateUser = require("./routes/authenticateUser");
app.use("/api", authenticateUser);

const retrieveUsers = require("./routes/retrieveUsers");
app.use("/api", retrieveUsers);

const retrieveGroups = require("./routes/retrieveGroups");
app.use("/api", retrieveGroups);

const createGroup = require("./routes/createGroup");
app.use("/api", createGroup);

app.listen(8080, () => {
    console.log("Server started on port 8080");
});