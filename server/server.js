const express = require("express");
const app = express();

const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "da-project"
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }

    console.log("Connected to the database!");
});

app.get("/users", (req, res) => {
    connection.query("SELECT * FROM users", (err, users) => {
        if (err) {
            console.error('Error selecting data:', err);
            return;
        }
    
        console.log("Users:", users);
        res.json({ users: users });
    });
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});