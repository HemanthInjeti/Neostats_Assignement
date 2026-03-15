const express = require("express");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const pollController = require("../controllers/pollController");

const router = express.Router();

router.get("/", auth, pollController.getPolls);
router.post("/", auth, allowRoles("secretariat"), pollController.createPoll);
router.post("/:id/vote", auth, allowRoles("staff"), pollController.votePoll);

module.exports = router;
