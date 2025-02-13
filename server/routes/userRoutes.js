const express = require("express");
const router = express.Router();
const { retrieveUser, updateProfile, retrieveUsers, createUser, updateUser, retrieveGroups, createGroup } = require("../controllers/usersController");
const { validateToken } = require("../middleware/validateToken");
const { i_checkGroup } = require("../middleware/checkGroup");

router.use(validateToken);

const checkIfAdmin = i_checkGroup("admin");

router.get("/retrieveUser", retrieveUser);
router.patch("/updateProfile", updateProfile);
router.get("/retrieveUsers", checkIfAdmin, retrieveUsers);
router.post("/createUser", checkIfAdmin, createUser);
router.put("/updateUser", checkIfAdmin, updateUser);
router.get("/retrieveGroups", retrieveGroups);
router.post("/createGroup", checkIfAdmin, createGroup);

module.exports = router;