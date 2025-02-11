const express = require("express");
const router = express.Router();
const { retrieveUser, retrieveUserGroups, updateProfile, retrieveUsers, createUser, updateUser, retrieveGroups, createGroup } = require("../controllers/usersController");
const { validateToken } = require("../middleware/validateToken");
const { i_checkGroup } = require("../middleware/checkGroup");

router.use(validateToken);

router.get("/retrieveUser", retrieveUser);
router.patch("/updateProfile", updateProfile);
router.get("/retrieveUsers", i_checkGroup, retrieveUsers);
router.post("/createUser", i_checkGroup, createUser);
router.put("/updateUser", i_checkGroup, updateUser);
router.get("/retrieveGroups", i_checkGroup, retrieveGroups);
router.post("/createGroup", i_checkGroup, createGroup);

module.exports = router;