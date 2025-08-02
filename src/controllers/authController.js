// Authentication Controller
// Handles user registration, login, OTP verification, and JWT token management

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, ServiceRequest, Subscription } = require('../models');
const smsService = require('../services/smsService');
const redis = require('../config/redis');
const { generateOTP } = require('../utils/helpers');
const { Op } = require('sequelize');

// In-memory fallback for OTP storage when Redis is unavailable
const otpStorage = new Map();

class AuthController {
  async register(req, res) {
    try {
      const { business_name, contact_person, phone, email, location, industries, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ phone }, { email }]
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this phone or email'
        });
      }
      
      // Create user
      const user = await User.create({
        business_name,
        contact_person,
        phone,
        email,
        location,
        industries,
        password, // Include password if provided
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
      });
      
      // Send OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      await redis.setex(`otp_${phone}`, 300, JSON.stringify({
        otp,
        expires_at: expiresAt,
        user_id: user.id
      }));
      
      await smsService.sendOTP(phone, otp);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. OTP sent to your phone.',
        data: {
          user_id: user.id,
          otp_expires_at: expiresAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }
  
  async sendOtp(req, res) {
    try {
      const { phone } = req.body;
      
      if (!phone || !/^\+91[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Valid phone number is required'
        });
      }
      
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      // Store OTP in Redis or fallback to in-memory storage
      if (redis.isConnected) {
        await redis.setex(`otp_${phone}`, 300, JSON.stringify({
          otp,
          expires_at: expiresAt
        }));
      } else {
        // Fallback to in-memory storage
        console.log('⚠️  Redis unavailable, using in-memory OTP storage');
        otpStorage.set(`otp_${phone}`, {
          otp,
          expires_at: expiresAt
        });
        
        // Clean up expired OTPs from memory
        setTimeout(() => {
          otpStorage.delete(`otp_${phone}`);
        }, 300000); // 5 minutes
      }
      
      await smsService.sendOTP(phone, otp);
      
      console.log(`📱 OTP generated for ${phone}: ${otp}`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully',
        expires_at: expiresAt
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      });
    }
  }
  
  async verifyOtp(req, res) {
    try {
      const { phone, otp } = req.body;
      
      // Try to get OTP from Redis first, then fallback to in-memory storage
      let otpData = null;
      
      if (redis.isConnected) {
        const cachedOtp = await redis.get(`otp_${phone}`);
        if (cachedOtp) {
          otpData = JSON.parse(cachedOtp);
        }
      }
      
      // If not found in Redis or Redis unavailable, check in-memory storage
      if (!otpData) {
        const memoryOtp = otpStorage.get(`otp_${phone}`);
        if (memoryOtp) {
          otpData = memoryOtp;
        }
      }
      
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired or invalid'
        });
      }
      
      if (otpData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }
      
      if (new Date() > new Date(otpData.expires_at)) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired'
        });
      }
      
      // Find user
      const user = await User.findOne({ where: { phone } });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }
      
      // Update phone verification
      await user.update({ phone_verified_at: new Date() });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Clear OTP from both Redis and in-memory storage
      if (redis.isConnected) {
        await redis.del(`otp_${phone}`);
      }
      otpStorage.delete(`otp_${phone}`);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        error: error.message
      });
    }
  }
  
  async login(req, res) {
    try {
      const { phone, email, password } = req.body;
      
      // Find user by phone or email
      const user = await User.findOne({ 
        where: phone ? { phone } : { email }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }
      
      // If password provided, validate it
      if (password) {
        if (!user.password) {
          return res.status(400).json({
            success: false,
            message: 'Password not set. Please use OTP login.'
          });
        }
        
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            message: 'Invalid password'
          });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, phone: user.phone },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: user.toJSON(),
            token
          }
        });
      } else {
        // Send OTP for login
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        
        await redis.setex(`otp_${user.phone}`, 300, JSON.stringify({
          otp,
          expires_at: expiresAt
        }));
        
        await smsService.sendOTP(user.phone, otp);
        
        res.json({
          success: true,
          message: 'OTP sent to your phone',
          expires_at: expiresAt
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }
  
  async logout(req, res) {
    try {
      // In a more complex setup, you might want to blacklist the token
      // For now, we'll just send a success response
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }
  
  async refresh(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }
      
      // Generate new token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      });
    }
  }
  
  async me(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        include: [
          { model: ServiceRequest, as: 'serviceRequests' },
          { model: Subscription, as: 'subscriptions' }
        ]
      });
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user data',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();