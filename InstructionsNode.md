# VendorIQ Node.js Backend Development Guide

This document provides comprehensive information for backend developers to implement the Node.js API for VendorIQ platform.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Database Schema](#database-schema)
4. [Node.js Models](#nodejs-models)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Authentication System](#authentication-system)
7. [File Upload System](#file-upload-system)
8. [Dynamic Form System](#dynamic-form-system)
9. [Payment Integration](#payment-integration)
10. [Admin Features](#admin-features)
11. [Notifications](#notifications)
12. [Implementation Priority](#implementation-priority)

## Project Overview

VendorIQ is a B2B platform that replaces chaotic WhatsApp trade groups across industries. It allows businesses to:
- Post service requests with industry-specific forms
- Respond to opportunities from other businesses
- Manage B2B transactions efficiently
- Get verified and build reputation through ratings

### Key Features
- **Free 30-day trial** for every business
- **Paid plans** starting at ₹200-₹300/month
- **Industry-specific modules** (Travel, Events, Logistics, etc.)
- **Verification system** for businesses
- **Rating & review system**
- **Real-time notifications**

## Frontend Architecture

### Technology Stack
- **Framework**: Vue.js 3 with Composition API
- **Routing**: Vue Router
- **State Management**: Pinia stores
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Build Tool**: Vite

### Component Structure
```
src/
├── components/
│   ├── Layout.vue          # Main layout with navigation
│   └── Empty.vue           # Empty state component
├── pages/
│   ├── LandingPage.vue     # Public landing page
│   ├── ListingWall.vue     # Main dashboard showing all requests
│   ├── PostRequest.vue     # Multi-step form for creating requests
│   ├── RequestDetails.vue  # Individual request view with responses
│   ├── MyRequests.vue      # User's own requests management
│   ├── Profile.vue         # User profile and business info
│   ├── AdminDashboard.vue  # Admin panel
│   ├── PricingPage.vue     # Subscription plans
│   └── Register.vue        # User registration
├── stores/
│   ├── auth.ts            # Authentication state management
│   └── requests.ts        # Requests and responses state
└── router/
    └── index.ts           # Route definitions
```

### State Management (Pinia Stores)

#### Auth Store (`stores/auth.ts`)
```typescript
interface User {
  id: string
  businessName: string
  contactPerson: string
  phone: string
  email: string
  location: string
  industries: string[]
  isVerified: boolean
  rating: number
  totalReviews: number
  joinedDate: string
  subscriptionStatus: 'trial' | 'active' | 'expired'
  trialEndsAt?: string
}
```

#### Requests Store (`stores/requests.ts`)
```typescript
interface ServiceRequest {
  id: string
  title: string
  description: string
  industry: string
  category: string
  location: string
  budget?: string
  deadline?: string
  status: 'open' | 'fulfilled' | 'closed'
  createdBy: string
  createdAt: string
  updatedAt: string
  attachments?: string[]
  customFields?: Record<string, any>
  responseCount: number
  viewCount: number
}

interface RequestResponse {
  id: string
  requestId: string
  responderId: string
  responderName: string
  responderRating: number
  message: string
  contactInfo: string
  attachments?: string[]
  price?: string
  timeline?: string
  createdAt: string
  isSelected: boolean
}
```

### Frontend Data Flow
1. **Authentication**: Mock login system (needs real OTP-based auth)
2. **Request Creation**: Multi-step form with dynamic fields based on industry/category
3. **Request Listing**: Filtered and searchable list with real-time updates
4. **Response System**: Users can respond to requests with contact info and pricing
5. **Status Management**: Request owners can select responses and mark as fulfilled

## Database Schema

### Core Tables (MySQL/PostgreSQL)

#### Users Table
```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    password VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    industries JSON, -- Array of industry names
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSON,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    subscription_status ENUM('trial', 'active', 'expired') DEFAULT 'trial',
    trial_ends_at DATETIME,
    last_payment_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_subscription (subscription_status),
    INDEX idx_location (location)
);
```

#### Industries Table
```sql
CREATE TABLE industries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Categories Table
```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    industry_id BIGINT UNSIGNED,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_per_industry (industry_id, slug)
);
```

#### Form Fields Table
```sql
CREATE TABLE form_fields (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED,
    field_name VARCHAR(255) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'date', 'select', 'textarea', 'checkbox', 'radio') DEFAULT 'text',
    placeholder VARCHAR(255),
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSON,
    options JSON, -- For select/radio fields
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

#### Service Requests Table
```sql
CREATE TABLE service_requests (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry_id BIGINT UNSIGNED,
    category_id BIGINT UNSIGNED,
    location VARCHAR(255) NOT NULL,
    budget VARCHAR(255),
    deadline DATETIME,
    status ENUM('open', 'fulfilled', 'closed') DEFAULT 'open',
    created_by CHAR(36),
    custom_fields JSON, -- Dynamic field values
    attachments JSON, -- Array of file URLs
    response_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (industry_id) REFERENCES industries(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_status (status),
    INDEX idx_industry (industry_id),
    INDEX idx_category (category_id),
    INDEX idx_location (location),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);
```

#### Request Responses Table
```sql
CREATE TABLE request_responses (
    id CHAR(36) PRIMARY KEY,
    request_id CHAR(36),
    responder_id CHAR(36),
    message TEXT NOT NULL,
    contact_info VARCHAR(255) NOT NULL,
    price VARCHAR(255),
    timeline VARCHAR(255),
    attachments JSON,
    is_selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_request (request_id),
    INDEX idx_responder (responder_id),
    INDEX idx_selected (is_selected)
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id CHAR(36),
    reviewer_id CHAR(36),
    reviewed_id CHAR(36),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES service_requests(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_id) REFERENCES users(id),
    
    UNIQUE KEY unique_review_per_request (request_id, reviewer_id, reviewed_id)
);
```

#### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36),
    plan_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    payment_method VARCHAR(255),
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status)
);
```

#### Files Table
```sql
CREATE TABLE files (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_type ENUM('image', 'document', 'other') NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (file_type)
);
```

## Node.js Models (Using Sequelize ORM)

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Sequelize (MySQL/PostgreSQL)
- **Authentication**: JWT with bcrypt
- **Validation**: Joi or express-validator
- **File Upload**: Multer
- **Real-time**: Socket.io
- **Payment**: Razorpay SDK
- **SMS**: Twilio/MSG91

### User Model
```javascript
// models/User.js
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

class User extends Model {
  // Helper methods
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  isTrialActive() {
    return this.subscription_status === 'trial' && 
           this.trial_ends_at && 
           new Date(this.trial_ends_at) > new Date();
  }

  canPostRequests() {
    return this.subscription_status === 'active' || this.isTrialActive();
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.remember_token;
    return values;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  phone_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  industries: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_documents: {
    type: DataTypes.JSON,
    defaultValue: null
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  subscription_status: {
    type: DataTypes.ENUM('trial', 'active', 'expired'),
    defaultValue: 'trial'
  },
  trial_ends_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_payment_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  remember_token: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  },
  indexes: [
    { fields: ['phone'] },
    { fields: ['email'] },
    { fields: ['subscription_status'] },
    { fields: ['location'] }
  ]
});

module.exports = User;
```

### ServiceRequest Model
```javascript
// models/ServiceRequest.js
const { DataTypes, Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

class ServiceRequest extends Model {
  // Scopes
  static getOpen() {
    return this.findAll({ where: { status: 'open' } });
  }

  static getByIndustry(industryId) {
    return this.findAll({ where: { industry_id: industryId } });
  }

  static getByLocation(location) {
    return this.findAll({
      where: {
        location: {
          [sequelize.Op.like]: `%${location}%`
        }
      }
    });
  }
}

ServiceRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  industry_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'industries',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  budget: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'fulfilled', 'closed'),
    defaultValue: 'open'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  custom_fields: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  response_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'ServiceRequest',
  tableName: 'service_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['industry_id'] },
    { fields: ['category_id'] },
    { fields: ['location'] },
    { fields: ['created_by'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ServiceRequest;
```

### Model Associations
```javascript
// models/associations.js
const User = require('./User');
const ServiceRequest = require('./ServiceRequest');
const RequestResponse = require('./RequestResponse');
const Industry = require('./Industry');
const Category = require('./Category');
const FormField = require('./FormField');
const Review = require('./Review');
const Subscription = require('./Subscription');
const File = require('./File');

// User associations
User.hasMany(ServiceRequest, { foreignKey: 'created_by', as: 'serviceRequests' });
User.hasMany(RequestResponse, { foreignKey: 'responder_id', as: 'responses' });
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'reviewsGiven' });
User.hasMany(Review, { foreignKey: 'reviewed_id', as: 'reviewsReceived' });
User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });
User.hasMany(File, { foreignKey: 'user_id', as: 'files' });

// ServiceRequest associations
ServiceRequest.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
ServiceRequest.belongsTo(Industry, { foreignKey: 'industry_id', as: 'industry' });
ServiceRequest.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
ServiceRequest.hasMany(RequestResponse, { foreignKey: 'request_id', as: 'responses' });
ServiceRequest.hasMany(Review, { foreignKey: 'request_id', as: 'reviews' });

// Industry associations
Industry.hasMany(Category, { foreignKey: 'industry_id', as: 'categories' });
Industry.hasMany(ServiceRequest, { foreignKey: 'industry_id', as: 'requests' });

// Category associations
Category.belongsTo(Industry, { foreignKey: 'industry_id', as: 'industry' });
Category.hasMany(FormField, { foreignKey: 'category_id', as: 'formFields' });
Category.hasMany(ServiceRequest, { foreignKey: 'category_id', as: 'requests' });

// RequestResponse associations
RequestResponse.belongsTo(ServiceRequest, { foreignKey: 'request_id', as: 'request' });
RequestResponse.belongsTo(User, { foreignKey: 'responder_id', as: 'responder' });

// Review associations
Review.belongsTo(ServiceRequest, { foreignKey: 'request_id', as: 'request' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewed_id', as: 'reviewed' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// File associations
File.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// FormField associations
FormField.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = {
  User,
  ServiceRequest,
  RequestResponse,
  Industry,
  Category,
  FormField,
  Review,
  Subscription,
  File
};
```

## API Routes & Endpoints (Express.js)

### Project Structure
```
src/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── serviceRequestController.js
│   ├── responseController.js
│   ├── industryController.js
│   ├── categoryController.js
│   ├── fileController.js
│   ├── paymentController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   ├── upload.js
│   └── admin.js
├── models/
│   ├── User.js
│   ├── ServiceRequest.js
│   ├── associations.js
│   └── index.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── requests.js
│   ├── industries.js
│   ├── files.js
│   ├── payments.js
│   └── admin.js
├── services/
│   ├── smsService.js
│   ├── paymentService.js
│   └── notificationService.js
├── utils/
│   ├── validation.js
│   ├── helpers.js
│   └── constants.js
├── config/
│   ├── database.js
│   ├── redis.js
│   └── config.js
└── app.js
```

### Authentication Routes
```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateOTP } = require('../middleware/validation');

router.post('/register', validateRegistration, authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', validateOTP, authController.verifyOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authController.me);

module.exports = router;
```

### Authentication Controller
```javascript
// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const smsService = require('../services/smsService');
const redis = require('../config/redis');
const { generateOTP } = require('../utils/helpers');

class AuthController {
  async register(req, res) {
    try {
      const { business_name, contact_person, phone, email, location, industries } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [sequelize.Op.or]: [{ phone }, { email }]
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
      
      await redis.setex(`otp_${phone}`, 300, JSON.stringify({
        otp,
        expires_at: expiresAt
      }));
      
      await smsService.sendOTP(phone, otp);
      
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
      
      const cachedOtp = await redis.get(`otp_${phone}`);
      
      if (!cachedOtp) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired or invalid'
        });
      }
      
      const otpData = JSON.parse(cachedOtp);
      
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
      
      // Clear OTP
      await redis.del(`otp_${phone}`);
      
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
```

### Service Requests Routes
```javascript
// routes/requests.js
const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const responseController = require('../controllers/responseController');
const auth = require('../middleware/auth');
const { validateServiceRequest, validateResponse } = require('../middleware/validation');

// Public routes
router.get('/', serviceRequestController.index);
router.get('/:id', serviceRequestController.show);
router.post('/:id/view', serviceRequestController.incrementView);

// Protected routes
router.use(auth);
router.post('/', validateServiceRequest, serviceRequestController.store);
router.put('/:id', validateServiceRequest, serviceRequestController.update);
router.delete('/:id', serviceRequestController.destroy);
router.patch('/:id/status', serviceRequestController.updateStatus);
router.post('/:id/reopen', serviceRequestController.reopen);

// Response routes
router.get('/:id/responses', responseController.index);
router.post('/:id/responses', validateResponse, responseController.store);
router.put('/responses/:responseId', validateResponse, responseController.update);
router.delete('/responses/:responseId', responseController.destroy);
router.post('/responses/:responseId/select', responseController.select);

module.exports = router;
```

### Service Request Controller
```javascript
// controllers/serviceRequestController.js
const { ServiceRequest, User, Industry, Category, RequestResponse } = require('../models');
const { Op } = require('sequelize');
const { validateDynamicFields } = require('../services/formValidationService');

class ServiceRequestController {
  async index(req, res) {
    try {
      const {
        page = 1,
        limit = 15,
        industry,
        category,
        location,
        status = 'open',
        search
      } = req.query;
      
      const offset = (page - 1) * limit;
      const where = {};
      
      if (industry) where.industry_id = industry;
      if (category) where.category_id = category;
      if (status) where.status = status;
      if (location) {
        where.location = {
          [Op.like]: `%${location}%`
        };
      }
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await ServiceRequest.findAndCountAll({
        where,
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { 
            model: User, 
            as: 'creator',
            attributes: ['id', 'business_name', 'rating', 'is_verified']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: {
          current_page: parseInt(page),
          data: rows,
          per_page: parseInt(limit),
          total: count,
          last_page: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch requests',
        error: error.message
      });
    }
  }
  
  async store(req, res) {
    try {
      const {
        title,
        description,
        industry_id,
        category_id,
        location,
        budget,
        deadline,
        custom_fields
      } = req.body;
      
      // Validate user can post requests
      const user = await User.findByPk(req.userId);
      if (!user.canPostRequests()) {
        return res.status(403).json({
          success: false,
          message: 'Subscription required to post requests'
        });
      }
      
      // Validate dynamic fields
      if (custom_fields && category_id) {
        const validationResult = await validateDynamicFields(category_id, custom_fields);
        if (!validationResult.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.errors
          });
        }
      }
      
      const serviceRequest = await ServiceRequest.create({
        title,
        description,
        industry_id,
        category_id,
        location,
        budget,
        deadline,
        custom_fields: custom_fields || {},
        created_by: req.userId
      });
      
      const requestWithRelations = await ServiceRequest.findByPk(serviceRequest.id, {
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { model: User, as: 'creator' }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Request created successfully',
        data: requestWithRelations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create request',
        error: error.message
      });
    }
  }
  
  async show(req, res) {
    try {
      const { id } = req.params;
      
      const serviceRequest = await ServiceRequest.findByPk(id, {
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { model: User, as: 'creator' },
          {
            model: RequestResponse,
            as: 'responses',
            include: [{ model: User, as: 'responder' }]
          }
        ]
      });
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      res.json({
        success: true,
        data: serviceRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch request',
        error: error.message
      });
    }
  }
  
  async incrementView(req, res) {
    try {
      const { id } = req.params;
      
      await ServiceRequest.increment('view_count', {
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'View count updated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update view count',
        error: error.message
      });
    }
  }
}

module.exports = new ServiceRequestController();
```

## Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user inactive.'
      });
    }
    
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

module.exports = auth;
```

## File Upload System
```javascript
// controllers/fileController.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { File } = require('../models');
const fs = require('fs').promises;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads', req.userId);
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = uuidv4() + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  
  const fileType = req.body.type || 'document';
  
  if (allowedTypes[fileType] && allowedTypes[fileType].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

class FileController {
  async upload(req, res) {
    try {
      const { file } = req;
      const { type = 'document' } = req.body;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const fileRecord = await File.create({
        user_id: req.userId,
        original_name: file.originalname,
        file_name: file.filename,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: type
      });
      
      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          id: fileRecord.id,
          url: `/api/files/${fileRecord.id}`,
          original_name: fileRecord.original_name,
          file_size: fileRecord.file_size
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: error.message
      });
    }
  }
  
  async show(req, res) {
    try {
      const { id } = req.params;
      
      const file = await File.findByPk(id);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      // Check if user has access to file
      if (file.user_id !== req.userId && !file.is_public) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.sendFile(path.resolve(file.file_path));
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve file',
        error: error.message
      });
    }
  }
}

module.exports = {
  FileController: new FileController(),
  upload
};
```

## Payment Integration (Razorpay)
```javascript
// services/paymentService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Subscription } = require('../models');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency,
        receipt,
        notes
      });
      
      return order;
    } catch (error) {
      throw new Error(`Payment order creation failed: ${error.message}`);
    }
  }
  
  verifyPaymentSignature(orderId, paymentId, signature) {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === signature;
  }
  
  async processSubscription(userId, planName, duration, paymentId) {
    const plans = {
      basic: { monthly: 200, yearly: 2000 },
      premium: { monthly: 300, yearly: 3000 }
    };
    
    const amount = plans[planName][duration];
    const durationMonths = duration === 'yearly' ? 12 : 1;
    
    const subscription = await Subscription.create({
      user_id: userId,
      plan_name: planName,
      amount,
      payment_id: paymentId,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000)
    });
    
    return subscription;
  }
}

module.exports = new PaymentService();
```

## Environment Configuration
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vendoriq
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# SMS Service
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Package.json Dependencies
```json
{
  "name": "vendoriq-backend",
  "version": "1.0.0",
  "description": "VendorIQ B2B Platform Backend API",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "migrate": "npx sequelize-cli db:migrate",
    "seed": "npx sequelize-cli db:seed:all",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.32.1",
    "mysql2": "^3.6.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "multer": "^1.4.5-lts.1",
    "redis": "^4.6.7",
    "razorpay": "^2.9.2",
    "twilio": "^4.14.0",
    "nodemailer": "^6.9.4",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1",
    "uuid": "^9.0.0",
    "moment": "^2.29.4",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.1",
    "supertest": "^6.3.3",
    "sequelize-cli": "^6.6.1"
  }
}
```

## Implementation Priority

### Phase 1 (Core Features)
1. **Database Setup**: Create all tables and relationships using Sequelize migrations
2. **Authentication**: JWT-based login/registration with OTP verification
3. **User Management**: Profile, verification system
4. **Industry/Category System**: Dynamic form configuration
5. **Service Requests**: CRUD operations with dynamic fields
6. **Response System**: Users can respond to requests
7. **Basic File Upload**: Image and document support

### Phase 2 (Business Features)
1. **Payment Integration**: Razorpay integration for subscriptions
2. **Subscription Management**: Trial, active, expired states
3. **Rating & Review System**: Post-project feedback
4. **Advanced Search**: Filters, sorting, pagination
5. **Notifications**: Real-time updates with Socket.io

### Phase 3 (Admin & Analytics)
1. **Admin Dashboard**: User management, content moderation
2. **Analytics**: Platform usage, revenue tracking
3. **Advanced Features**: Bulk operations, export functionality
4. **Performance Optimization**: Caching with Redis, indexing

### Phase 4 (Enhancements)
1. **Mobile API Optimization**: For future mobile apps
2. **Advanced Notifications**: Email, SMS integration
3. **AI Features**: Auto-matching, recommendations
4. **Third-party Integrations**: WhatsApp Business API

This comprehensive guide provides all the necessary information for backend developers to implement the VendorIQ Node.js API. The frontend is already built and ready to integrate with these endpoints.