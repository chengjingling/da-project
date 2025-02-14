const express = require("express");
const router = express.Router();
const { retrieveApps, createApp, updateApp, retrievePlans, createPlan, createTask } = require("../controllers/appController");
const { validateToken } = require("../middleware/validateToken");
const { i_checkGroup } = require("../middleware/checkGroup");

router.use(validateToken);

const checkIfPl = i_checkGroup("project_lead");
const checkIfPm = i_checkGroup("project_manager");

router.get("/retrieveApps", retrieveApps);
router.post("/createApp", checkIfPl, createApp);
router.put("/updateApp", checkIfPl, updateApp);
router.get("/retrievePlans", retrievePlans);
router.post("/createPlan", checkIfPm, createPlan);
router.post("/createTask", checkIfPl, createTask);

module.exports = router;