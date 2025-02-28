const express = require("express");
const app = express();
app.use(express.json());

const routes = require("./routes/routes");

app.use("/", routes);

app.listen(8000, () => {
    console.log("Server started on port 8000");
});