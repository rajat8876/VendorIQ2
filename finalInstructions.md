# VendorIQ Backend Development Guide - Ordered Implementation

## PHASE 1: FOUNDATION SETUP

### Step 1: Project Dependencies & Package.json

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

### Step 2: Environment Configuration (.env)

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

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=VendorIQ
SMTP_FROM_EMAIL=noreply@vendoriq.com

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

### Step 3: Technology Stack Overview

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Sequelize (MySQL/PostgreSQL)
- **Authentication**: JWT with bcrypt
- **Validation**: Joi or express-validator
- **File Upload**: Multer
- **Real-time**: Socket.io
- **Payment**: Razorpay SDK
- **Email**: Nodemailer with SMTP

---

## PHASE 2: DATABASE FOUNDATION

### Step 4: Database Schema Creation (In This Order)

#### 4.1 Users Table (Create First - No Dependencies)

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

#### 4.2 Industries Table (Create Second - No Dependencies)

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

#### 4.3 Categories Table (Create Third - Depends on Industries)

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

#### 4.4 Form Fields Table (Create Fourth - Depends on Categories)

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

#### 4.5 Service Requests Table (Create Fifth - Depends on Users, Industries, Categories)

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

#### 4.6 Request Responses Table (Create Sixth - Depends on Service Requests, Users)

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

#### 4.7 Reviews Table (Create Seventh)

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

#### 4.8 Subscriptions Table (Create Eighth)

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

#### 4.9 Files Table (Create Last)

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

---

## PHASE 3: PROJECT STRUCTURE SETUP

### Step 5: Create Directory Structure

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
│   ├── emailService.js
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

---

## PHASE 4: SEQUELIZE MODELS

### Step 6: User Model (Create First)

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

### Step 7: ServiceRequest Model

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

### Step 8: Model Associations

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

---

## PHASE 5: MIDDLEWARE SETUP

### Step 9: Authentication Middleware

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

---

## PHASE 6: AUTHENTICATION SYSTEM

### Step 10: Authentication Routes

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

### Step 11: Authentication Controller

```javascript
// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const emailService = require('../services/emailService');
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
      
      await redis.setex(`otp_${email}`, 300, JSON.stringify({
        otp,
        expires_at: expiresAt,
        user_id: user.id
      }));
      
      await emailService.sendOTP(email, otp);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. OTP sent to your email.',
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
      const { email } = req.body;
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Valid email address is required'
        });
      }
      
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      await redis.setex(`otp_${email}`, 300, JSON.stringify({
        otp,
        expires_at: expiresAt
      }));
      
      await emailService.sendOTP(email, otp);
      
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
      const { email, otp } = req.body;
      
      const cachedOtp = await redis.get(`otp_${email}`);
      
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
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.'
        });
      }
      
      // Update email verification
      await user.update({ email_verified_at: new Date() });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Clear OTP
      await redis.del(`otp_${email}`);
      
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

---

## PHASE 7: SERVICE REQUESTS API

### Step 12: Service Requests Routes

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

### Step 13: Service Request Controller

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
  
  async update(req, res) {
    try {
      const { id } = req.params;
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
      
      const serviceRequest = await ServiceRequest.findByPk(id);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check if user owns the request
      if (serviceRequest.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      await serviceRequest.update({
        title,
        description,
        industry_id,
        category_id,
        location,
        budget,
        deadline,
        custom_fields: custom_fields || {}
      });
      
      const updatedRequest = await ServiceRequest.findByPk(id, {
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { model: User, as: 'creator' }
        ]
      });
      
      res.json({
        success: true,
        message: 'Request updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update request',
        error: error.message
      });
    }
  }
  
  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      const serviceRequest = await ServiceRequest.findByPk(id);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check if user owns the request
      if (serviceRequest.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      await serviceRequest.destroy();
      
      res.json({
        success: true,
        message: 'Request deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete request',
        error: error.message
      });
    }
  }
  
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const serviceRequest = await ServiceRequest.findByPk(id);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check if user owns the request
      if (serviceRequest.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      await serviceRequest.update({ status });
      
      res.json({
        success: true,
        message: 'Request status updated successfully',
        data: serviceRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update request status',
        error: error.message
      });
    }
  }
}

module.exports = new ServiceRequestController();
```

---

## PHASE 8: FILE UPLOAD SYSTEM

### Step 14: File Upload Controller

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

---

## PHASE 9: PAYMENT INTEGRATION

### Step 15: Payment Service (Razorpay)

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

### Step 16: Payment Controller

```javascript
// controllers/paymentController.js
const paymentService = require('../services/paymentService');
const { User, Subscription } = require('../models');

class PaymentController {
  async createOrder(req, res) {
    try {
      const { plan, duration } = req.body;
      
      const plans = {
        basic: { monthly: 200, yearly: 2000 },
        premium: { monthly: 300, yearly: 3000 }
      };
      
      if (!plans[plan] || !plans[plan][duration]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan or duration'
        });
      }
      
      const amount = plans[plan][duration];
      const receipt = `order_${req.userId}_${Date.now()}`;
      
      const order = await paymentService.createOrder(amount, 'INR', receipt, {
        user_id: req.userId,
        plan,
        duration
      });
      
      res.json({
        success: true,
        data: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: error.message
      });
    }
  }
  
  async verifyPayment(req, res) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
        duration
      } = req.body;
      
      const isValid = paymentService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }
      
      // Process subscription
      const subscription = await paymentService.processSubscription(
        req.userId,
        plan,
        duration,
        razorpay_payment_id
      );
      
      // Update user subscription status
      await User.update(
        { 
          subscription_status: 'active',
          last_payment_at: new Date()
        },
        { where: { id: req.userId } }
      );
      
      res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        data: subscription
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
    }
  }
  
  async getSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.findAll({
        where: { user_id: req.userId },
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscriptions',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController();
```

---

## PHASE 10: SERVICES SETUP

### Step 17: Email Service

```javascript
// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  async sendOTP(email, otp) {
    try {
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: 'VendorIQ - Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your VendorIQ verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
  
  async sendNotification(email, subject, message) {
    try {
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${subject}</h2>
            <p>${message}</p>
          </div>
        `
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Email notification failed: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
```

### Step 18: Helper Utils

```javascript
// utils/helpers.js
const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const formatPhoneNumber = (phone) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +91 if not present
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  return phone;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhoneNumber = (phone) => {
  const re = /^\+91[6-9]\d{9}$/;
  return re.test(phone);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

module.exports = {
  generateOTP,
  generateRandomString,
  formatPhoneNumber,
  validateEmail,
  validatePhoneNumber,
  calculateDistance
};
```

---

## PHASE 11: MAIN APPLICATION FILE

### Step 19: App.js (Express Server Setup)

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const fileRoutes = require('./routes/files');
const paymentRoutes = require('./routes/payments');
const industryRoutes = require('./routes/industries');

// Import models to establish associations
require('./models/associations');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VendorIQ API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/industries', industryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found',
      errors: err.errors
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`VendorIQ API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1 Completion Checklist:
- [ ] Package.json created with all dependencies
- [ ] Environment variables configured
- [ ] Database connection established
- [ ] All database tables created in correct order
- [ ] Sample data inserted for testing

### Phase 2 Completion Checklist:
- [ ] All Sequelize models created
- [ ] Model associations configured
- [ ] Models can be imported without errors
- [ ] Test CRUD operations on User model

### Phase 3 Completion Checklist:
- [ ] Authentication middleware working
- [ ] Registration API functional
- [ ] OTP sending/verification working
- [ ] JWT token generation working
- [ ] Protected routes accessible with token

### Phase 4 Completion Checklist:
- [ ] Service requests CRUD API working
- [ ] File upload functionality working
- [ ] Payment integration functional
- [ ] All API endpoints return proper JSON responses
- [ ] Error handling working correctly

### Final Testing Commands:
```bash
# Start development server
npm run dev

# Test database connection
npm run migrate

# Test API endpoints
curl -X GET http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/register

# Test file upload
curl -X POST -F "file=@test.jpg" http://localhost:3000/api/files/upload
```

This complete development guide provides everything needed to build the VendorIQ backend in the correct order without getting stuck in dependency loops.