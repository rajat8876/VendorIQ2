// Payment Routes
// Routes for payment processing and subscriptions

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const createOrderSchema = Joi.object({
  plan: Joi.string().valid('basic', 'premium').required(),
  duration: Joi.string().valid('monthly', 'yearly').required()
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  plan: Joi.string().valid('basic', 'premium').required(),
  duration: Joi.string().valid('monthly', 'yearly').required()
});

// Payment routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Payment Integration System - Phase 9',
    endpoints: {
      'POST /create-order': 'Create payment order',
      'POST /verify': 'Verify payment and activate subscription',
      'GET /subscriptions': 'Get user subscriptions'
    }
  });
});

// Create payment order
router.post('/create-order', auth, validate(createOrderSchema), paymentController.createOrder);

// Verify payment
router.post('/verify', auth, validate(verifyPaymentSchema), paymentController.verifyPayment);

// Get user subscriptions
router.get('/subscriptions', auth, paymentController.getSubscriptions);

module.exports = router;