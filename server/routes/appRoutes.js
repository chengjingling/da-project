const express = require("express");
const router = express.Router();
const { createApp } = require("../controllers/appController");
const { validateToken } = require("../middleware/validateToken");
const { i_checkGroup } = require("../middleware/checkGroup");

router.use(validateToken);

const checkIfPl = i_checkGroup("project_lead");

router.post("/createApp", checkIfPl, createApp);

module.exports = router;