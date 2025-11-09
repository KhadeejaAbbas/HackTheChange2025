const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register/doctor', authController.registerDoctor);
router.post('/register/patient', authController.registerPatient);
router.post('/login', authController.login);
router.post('/confirm', authController.confirmSignUp);
router.post('/resend-confirmation', authController.resendConfirmationCode);

module.exports = router;
