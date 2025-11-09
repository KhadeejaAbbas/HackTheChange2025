const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const authenticateToken = require("../middleware/authenticateToken");

router.use(authenticateToken);

router.post("/", sessionController.createSession);
router.get("/", sessionController.getUserSessions);
router.get("/:sessionId", sessionController.getSessionById);
router.post("/:sessionId/start", sessionController.startSession);
router.post("/:sessionId/end", sessionController.endSession);
router.post("/:sessionId/messages", sessionController.addMessage);

module.exports = router;
