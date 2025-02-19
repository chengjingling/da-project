const express = require("express");
const router = express.Router();
const { login, logout, checkToken, checkIfAdmin, checkAccountStatus, checkPermits } = require("../controllers/authController");
const { validateToken } = require("../middleware/validateToken");

router.post("/login", login);
router.get("/logout", validateToken, logout);
router.get("/checkToken", checkToken);
router.get("/checkIfAdmin", validateToken, checkIfAdmin);
router.get("/checkAccountStatus", validateToken, checkAccountStatus);
router.get("/checkPermits", validateToken, checkPermits);

module.exports = router;