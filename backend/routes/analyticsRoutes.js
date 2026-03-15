const express = require("express");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.get("/", auth, allowRoles("secretariat", "admin"), analyticsController.getAnalytics);

module.exports = router;
