#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
    return output;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'cyan');
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found. Please run this script from the project root.', 'red');
    process.exit(1);
  }
  
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    log('⚠️  .env file not found. Please create one based on .env.production template.', 'yellow');
  }
  
  log('✅ Prerequisites check completed', 'green');
}

function deployToHeroku() {
  log('🚀 Deploying to Heroku...', 'magenta');
  
  // Check if Heroku CLI is installed
  try {
    execSync('heroku --version', { encoding: 'utf8' });
  } catch (error) {
    log('❌ Heroku CLI not found. Please install it from https://devcenter.heroku.com/articles/heroku-cli', 'red');
    process.exit(1);
  }
  
  // Check if git is initialized
  if (!fs.existsSync('.git')) {
    execCommand('git init', 'Initializing Git repository');
    execCommand('git add .', 'Adding files to Git');
    execCommand('git commit -m "Initial commit"', 'Creating initial commit');
  }
  
  // Create Heroku app if it doesn't exist
  try {
    execCommand('heroku apps:info', 'Checking existing Heroku app');
  } catch (error) {
    const appName = `vendoriq-backend-${Date.now()}`;
    execCommand(`heroku create ${appName}`, 'Creating new Heroku app');
  }
  
  // Add required add-ons
  execCommand('heroku addons:create jawsdb:kitefin --wait', 'Adding MySQL database');
  execCommand('heroku addons:create heroku-redis:mini --wait', 'Adding Redis cache');
  
  // Set environment variables
  execCommand('heroku config:set NODE_ENV=production', 'Setting NODE_ENV');
  execCommand(`heroku config:set JWT_SECRET=${generateRandomString(32)}`, 'Setting JWT_SECRET');
  
  // Deploy to Heroku
  execCommand('git add .', 'Adding files to Git');
  execCommand('git commit -m "Deploy to Heroku" --allow-empty', 'Committing changes');
  execCommand('git push heroku main', 'Pushing to Heroku');
  
  // Run migrations
  execCommand('heroku run npm run migrate', 'Running database migrations');
  
  log('🎉 Heroku deployment completed successfully!', 'green');
  execCommand('heroku open', 'Opening deployed application');
}

function deployToRailway() {
  log('🚀 Deploying to Railway...', 'magenta');
  
  // Check if Railway CLI is installed
  try {
    execSync('railway --version', { encoding: 'utf8' });
  } catch (error) {
    log('❌ Railway CLI not found. Please install it: npm install -g @railway/cli', 'red');
    process.exit(1);
  }
  
  // Login to Railway
  execCommand('railway login', 'Logging into Railway');
  
  // Initialize Railway project
  execCommand('railway init', 'Initializing Railway project');
  
  // Add MySQL service
  execCommand('railway add mysql', 'Adding MySQL database');
  
  // Add Redis service
  execCommand('railway add redis', 'Adding Redis cache');
  
  // Deploy to Railway
  execCommand('railway up', 'Deploying to Railway');
  
  log('🎉 Railway deployment completed successfully!', 'green');
}

function deployWithDocker() {
  log('🐳 Deploying with Docker...', 'magenta');
  
  // Check if Docker is installed
  try {
    execSync('docker --version', { encoding: 'utf8' });
  } catch (error) {
    log('❌ Docker not found. Please install Docker from https://docker.com', 'red');
    process.exit(1);
  }
  
  // Build Docker image
  execCommand('docker build -t vendoriq-backend .', 'Building Docker image');
  
  // Run with docker-compose
  execCommand('docker-compose up -d', 'Starting services with Docker Compose');
  
  // Wait for services to start
  log('⏳ Waiting for services to start...', 'yellow');
  setTimeout(() => {
    // Run migrations
    execCommand('docker-compose exec app npm run migrate', 'Running database migrations');
    
    log('🎉 Docker deployment completed successfully!', 'green');
    log('📱 Application is running at http://localhost:3000', 'cyan');
  }, 10000);
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function showUsage() {
  log('\n📋 VendorIQ Backend Deployment Script', 'cyan');
  log('\nUsage: node deploy.js [platform]', 'yellow');
  log('\nAvailable platforms:', 'yellow');
  log('  heroku  - Deploy to Heroku', 'white');
  log('  railway - Deploy to Railway', 'white');
  log('  docker  - Deploy with Docker locally', 'white');
  log('\nExample: node deploy.js heroku', 'yellow');
}

function main() {
  const platform = process.argv[2];
  
  if (!platform) {
    showUsage();
    process.exit(1);
  }
  
  checkPrerequisites();
  
  switch (platform.toLowerCase()) {
    case 'heroku':
      deployToHeroku();
      break;
    case 'railway':
      deployToRailway();
      break;
    case 'docker':
      deployWithDocker();
      break;
    default:
      log(`❌ Unknown platform: ${platform}`, 'red');
      showUsage();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  deployToHeroku,
  deployToRailway,
  deployWithDocker
};