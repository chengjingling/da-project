const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
const corsOptions = {
    origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));

const mysql = require("mysql2");
const dotenv = require("dotenv").config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
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
            console.error("Error selecting users:", err);
            return;
        }
    
        console.log("Users:", users);
        res.json({ users: users });
    });
});

app.post("/createGroup", (req, res) => {
    const data = req.body;
    data.username = "";
    
    connection.query("INSERT INTO user_group SET ?", data, (err, result) => {
        if (err) {
            console.error("Error inserting user-group:", err);
            return;
        }
        console.log("User-group inserted successfully!");
        res.json({ status: 200 });
   });
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});