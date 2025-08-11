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
  email: Joi.string().email().required(),
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
  email: Joi.string().email().required()
});

// Service Request validation schema
const serviceRequestSchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  description: Joi.string().min(10).max(5000).required(),
  industry_id: Joi.number().integer().positive().optional(),
  category_id: Joi.number().integer().positive().optional(),
  location: Joi.string().min(2).max(255).required(),
  budget: Joi.string().max(100).optional(),
  deadline: Joi.date().iso().greater('now').optional(),
  custom_fields: Joi.object().optional()
});

// Request Response validation schema
const responseSchema = Joi.object({
  message: Joi.string().min(10).max(2000).required(),
  contact_info: Joi.string().min(5).max(255).required(),
  price: Joi.string().max(100).optional(),
  timeline: Joi.string().max(255).optional(),
  attachments: Joi.array().items(Joi.string()).optional()
});

// Status update validation schema
const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('open', 'fulfilled', 'closed').required()
});

module.exports = {
  validateRegistration: validate(registrationSchema),
  validateOTP: validate(otpSchema),
  validateLogin: validate(loginSchema),
  validateSendOtp: validate(sendOtpSchema),
  validateServiceRequest: validate(serviceRequestSchema),
  validateResponse: validate(responseSchema),
  validateStatusUpdate: validate(statusUpdateSchema),
  validate
};