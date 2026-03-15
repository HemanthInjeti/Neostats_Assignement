const express = require("express");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const upload = require("../middleware/upload");
const meetingController = require("../controllers/meetingController");

const router = express.Router();

router.get("/", auth, meetingController.getMinutes);
router.post("/", auth, allowRoles("secretariat"), upload.single("file"), meetingController.uploadMinutes);

module.exports = router;
