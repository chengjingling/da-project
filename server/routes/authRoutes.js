const express = require("express");
const router = express.Router();
const { login, logout, checkToken, checkGroup, checkAccountStatus, checkPermits } = require("../controllers/authController");
const { validateToken } = require("../middleware/validateToken");

router.post("/login", login);
router.get("/logout", validateToken, logout);
router.get("/checkToken", checkToken);
router.get("/checkGroup", validateToken, checkGroup);
router.get("/checkAccountStatus", validateToken, checkAccountStatus);
router.get("/checkPermits", validateToken, checkPermits);

module.exports = router;