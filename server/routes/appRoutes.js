const express = require("express");
const router = express.Router();
const { retrieveApps, createApp, updateApp } = require("../controllers/appController");
const { validateToken } = require("../middleware/validateToken");
const { i_checkGroup } = require("../middleware/checkGroup");

router.use(validateToken);

const checkIfPl = i_checkGroup("project_lead");

router.get("/retrieveApps", retrieveApps);
router.post("/createApp", checkIfPl, createApp);
router.put("/updateApp", checkIfPl, updateApp);

module.exports = router;