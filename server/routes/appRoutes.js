const express = require("express");
const router = express.Router();
const { retrieveApps, createApp, updateApp, retrievePlans, createPlan, retrieveTasks, retrieveTask, createTask, updateTask } = require("../controllers/appController");
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
router.get("/retrieveTasks", retrieveTasks);
router.get("/retrieveTask", retrieveTask);
router.post("/createTask", checkIfPl, createTask);
router.patch("/updateTask", updateTask);

module.exports = router;