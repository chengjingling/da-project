const express = require("express");
const router = express.Router();
const { retrieveApps, createApp, updateApp, retrievePlans, createPlan, retrieveTasks, retrieveTask, createTask, updateTaskState, updateTaskPlan, updateTaskNotes } = require("../controllers/appController");
const { validateToken } = require("../middleware/validateToken");
const { i_checkGroup } = require("../middleware/checkGroup");
const { checkPermit } = require("../middleware/checkPermit");

router.use(validateToken);

const checkIfHardcodedPl = i_checkGroup("hardcoded_pl");
const checkIfHardcodedPm = i_checkGroup("hardcoded_pm");

router.get("/retrieveApps", retrieveApps);
router.post("/createApp", checkIfHardcodedPl, createApp);
router.put("/updateApp", checkIfHardcodedPl, updateApp);
router.get("/retrievePlans", retrievePlans);
router.post("/createPlan", checkIfHardcodedPm, createPlan);
router.get("/retrieveTasks", retrieveTasks);
router.get("/retrieveTask", retrieveTask);
router.post("/createTask", checkIfHardcodedPl, createTask);
router.patch("/updateTaskState", checkPermit, updateTaskState);
router.patch("/updateTaskPlan", checkPermit, updateTaskPlan);
router.patch("/updateTaskNotes", checkPermit, updateTaskNotes);

module.exports = router;