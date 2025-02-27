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

const routes = require("./routes/routes");

app.use("/", routes);

app.listen(8000, () => {
    console.log("Server started on port 8000");
});