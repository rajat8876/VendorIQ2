// Request Validation Middleware
// Joi validation schemas and helpers

const Joi = require('joi');

// Registration validation schema
const registrationSchema = Joi.object({
  business_name: Joi.string().min(2).max(255).required(),
  contact_person: Joi.string().min(2).max(255).required(),
  phone: Joi.string().pattern(/^\+91[0-9]{10}$/).required(),
  email: Joi.string().email().required(),
  location: Joi.string().min(2).max(255).required(),
  industries: Joi.array().items(Joi.string()).min(1).required(),
  password: Joi.string().min(6).optional() // Optional password for registration
});

// OTP validation schema
const otpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+91[0-9]{10}$/).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

// Login validation schema - supports both email+password and phone+password
const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+91[0-9]{10}$/).optional(),
  password: Joi.string().min(6).optional()
}).or('email', 'phone');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Send OTP validation schema
const sendOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+91[0-9]{10}$/).required()
});

// Export validation middlewares
module.exports = {
  validateRegistration: validate(registrationSchema),
  validateOTP: validate(otpSchema),
  validateLogin: validate(loginSchema),
  validateSendOtp: validate(sendOtpSchema),
  validate
};