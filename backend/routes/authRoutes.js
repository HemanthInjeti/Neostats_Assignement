const express = require("express");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.me);
router.get("/users", auth, allowRoles("admin"), authController.listUsers);
router.get("/users/case-managers", auth, allowRoles("secretariat", "admin"), authController.listCaseManagers);
router.put("/users/:id", auth, allowRoles("admin"), authController.updateUser);

module.exports = router;
