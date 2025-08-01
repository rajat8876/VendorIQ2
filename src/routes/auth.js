// Authentication Routes
// Routes for login, register, OTP verification

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateOTP, validateLogin, validateSendOtp } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/send-otp', validateSendOtp, authController.sendOtp);
router.post('/verify-otp', validateOTP, authController.verifyOtp);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.post('/logout', auth, authController.logout);
router.post('/refresh', auth, authController.refresh);
router.get('/me', auth, authController.me);

module.exports = router;