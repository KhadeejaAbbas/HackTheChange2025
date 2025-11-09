const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const authenticateToken = require("../middleware/authenticateToken");

// Get all patients (doctors only)
router.get("/", authenticateToken, patientController.getAllPatients);

module.exports = router;
