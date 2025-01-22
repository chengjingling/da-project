const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

app.get("/users", (req, res) => {
    res.json({ users: ["Alice", "Bob", "Cassie"] });
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});