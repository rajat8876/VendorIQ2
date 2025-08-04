#!/usr/bin/env node

/**
 * Setup script for Render deployment
 * This script helps prepare your VendorIQ backend for Render deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up VendorIQ Backend for Render Deployment\n');

// 1. Update package.json with PostgreSQL dependencies
function updatePackageJson() {
  console.log('📦 Updating package.json with PostgreSQL dependencies...');
  
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add PostgreSQL dependencies
  packageJson.dependencies = {
    ...packageJson.dependencies,
    'pg': '^8.11.0',
    'pg-hstore': '^2.3.4'
  };
  
  // Add production migration script
  packageJson.scripts = {
    ...packageJson.scripts,
    'migrate:prod': 'NODE_ENV=production npx sequelize-cli db:migrate',
    'seed:prod': 'NODE_ENV=production npx sequelize-cli db:seed:all'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated successfully\n');
}

// 2. Update database configuration for PostgreSQL
function updateDatabaseConfig() {
  console.log('🗄️  Updating database configuration for PostgreSQL...');
  
  const configPath = path.join(__dirname, 'src', 'config', 'config.js');
  
  const newConfig = `module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vendoriq_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    timezone: '+05:30'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vendoriq_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    timezone: '+05:30'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    timezone: '+05:30'
  }
};
`;
  
  fs.writeFileSync(configPath, newConfig);
  console.log('✅ Database configuration updated for PostgreSQL\n');
}

// 3. Create .env.render template
function createRenderEnvTemplate() {
  console.log('📝 Creating Render environment variables template...');
  
  const envTemplate = `# Render Environment Variables Template
# Copy these to your Render service environment variables

# Basic Configuration
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-here-change-this
CORS_ORIGIN=*

# Database Configuration (Get from Render PostgreSQL service)
DB_HOST=your-render-postgres-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_DIALECT=postgres

# Redis Configuration (Optional - from Render Redis service)
REDIS_URL=redis://your-render-redis-url

# Payment Integration (Add your actual Razorpay credentials)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# SMS Integration (Add your actual Twilio credentials)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
  
  fs.writeFileSync('.env.render', envTemplate);
  console.log('✅ .env.render template created\n');
}

// 4. Display next steps
function displayNextSteps() {
  console.log('🎉 Setup completed! Next steps:\n');
  console.log('1. 📚 Read the deployment guide:');
  console.log('   📖 RENDER_DEPLOYMENT.md\n');
  
  console.log('2. 🔧 Install PostgreSQL dependencies:');
  console.log('   npm install\n');
  
  console.log('3. 📤 Push to GitHub:');
  console.log('   git add .');
  console.log('   git commit -m "Prepare for Render deployment"');
  console.log('   git push origin main\n');
  
  console.log('4. 🌐 Deploy on Render:');
  console.log('   - Go to render.com');
  console.log('   - Create new Web Service');
  console.log('   - Connect your GitHub repository');
  console.log('   - Add environment variables from .env.render\n');
  
  console.log('5. 🗄️  Set up PostgreSQL database on Render');
  console.log('6. 🚀 Run migrations after deployment\n');
  
  console.log('📋 Files updated:');
  console.log('   ✅ package.json');
  console.log('   ✅ src/config/config.js');
  console.log('   ✅ .env.render (template)\n');
  
  console.log('🆘 Need help? Check RENDER_DEPLOYMENT.md for detailed instructions!');
}

// Run setup
try {
  updatePackageJson();
  updateDatabaseConfig();
  createRenderEnvTemplate();
  displayNextSteps();
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}