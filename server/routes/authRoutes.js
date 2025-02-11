const express = require("express");
const router = express.Router();
const { login, logout, checkToken, checkPermission, checkAccountStatus } = require("../controllers/authController");
const { validateToken } = require("../middleware/validateToken");

router.post("/login", login);
router.get("/logout", validateToken, logout);
router.get("/checkToken", checkToken);
router.get("/checkPermission", validateToken, checkPermission);
router.get("/checkAccountStatus", validateToken, checkAccountStatus);

module.exports = router;