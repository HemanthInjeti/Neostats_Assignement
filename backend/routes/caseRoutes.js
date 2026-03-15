const express = require("express");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const upload = require("../middleware/upload");
const caseController = require("../controllers/caseController");

const router = express.Router();

router.get("/public/digest", auth, caseController.getPublicDigest);
router.post("/", auth, allowRoles("staff"), upload.single("attachment"), caseController.createCase);
router.get("/", auth, caseController.getCases);
router.get("/:id", auth, caseController.getCaseById);
router.patch("/:id/assign", auth, allowRoles("secretariat"), caseController.assignCase);
router.patch("/:id", auth, allowRoles("case_manager"), caseController.updateCase);

module.exports = router;
