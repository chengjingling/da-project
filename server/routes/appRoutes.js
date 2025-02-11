const express = require("express");
const router = express.Router();
const { createApp } = require("../controllers/appController");

router.post("/createApp", createApp);

module.exports = router;