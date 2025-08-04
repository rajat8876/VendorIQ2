# VendorIQ Backend Deployment Checklist

## Pre-Deployment Checklist

### 🔧 Environment Setup
- [ ] Copy `.env.production` to `.env` and update with actual values
- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Configure database connection (MySQL)
- [ ] Set up Redis connection (optional but recommended)
- [ ] Configure CORS_ORIGIN with your frontend domain

### 💳 Payment Integration (Optional)
- [ ] Get Razorpay API credentials
- [ ] Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
- [ ] Test payment integration in sandbox mode

### 📱 SMS Service (Optional)
- [ ] Get Twilio account credentials
- [ ] Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
- [ ] Test SMS functionality

### 🗄️ Database Setup
- [ ] Create MySQL database
- [ ] Update database credentials in environment variables
- [ ] Test database connection

## Deployment Options

### 🚀 Quick Deploy (Recommended for beginners)

#### Heroku (Free tier available)
```bash
npm run deploy:heroku
```

#### Railway (Modern platform)
```bash
npm run deploy:railway
```

#### Docker (Local deployment)
```bash
npm run deploy:docker
```

### 🛠️ Manual Deployment

#### 1. Heroku Manual Setup
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add database
heroku addons:create jawsdb:kitefin

# Add Redis
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CORS_ORIGIN=https://your-frontend.com

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

#### 2. Railway Manual Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add services
railway add mysql
railway add redis

# Deploy
railway up
```

#### 3. DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings
3. Add MySQL database
4. Set environment variables
5. Deploy

#### 4. AWS EC2
1. Launch EC2 instance
2. Install Node.js, MySQL, Redis
3. Clone repository
4. Install dependencies
5. Configure environment
6. Start with PM2
7. Configure Nginx (optional)

## Post-Deployment Checklist

### ✅ Verification Steps
- [ ] Health check endpoint responds: `GET /health`
- [ ] API info endpoint responds: `GET /api`
- [ ] Database connection is working
- [ ] Redis connection is working (if configured)
- [ ] File upload directory is writable
- [ ] CORS is properly configured

### 🔒 Security Checklist
- [ ] HTTPS is enabled
- [ ] Strong JWT secret is set
- [ ] Database credentials are secure
- [ ] Environment variables are not exposed
- [ ] Rate limiting is enabled
- [ ] File upload restrictions are in place

### 📊 Monitoring Setup
- [ ] Set up application monitoring
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Set up performance monitoring

## Testing Deployment

### 🧪 API Testing
```bash
# Health check
curl https://your-api-domain.com/health

# API info
curl https://your-api-domain.com/api

# Test authentication (should return 401)
curl https://your-api-domain.com/api/users/profile

# Test CORS
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-api-domain.com/api
```

### 🔧 Database Testing
```bash
# Test database connection (if using Heroku)
heroku run node -e "require('./src/config/database').sequelize.authenticate().then(() => console.log('DB Connected')).catch(console.error)"

# Run migrations
heroku run npm run migrate

# Check tables
heroku run node -e "require('./src/models').sequelize.query('SHOW TABLES').then(console.log)"
```

## Troubleshooting

### 🐛 Common Issues

#### Database Connection Errors
- Check database credentials
- Verify database server is running
- Check firewall settings
- Ensure database exists

#### Port Issues
- Verify PORT environment variable
- Check if port is already in use
- Ensure application binds to correct port

#### File Upload Issues
- Check upload directory permissions
- Verify MAX_FILE_SIZE setting
- Ensure disk space is available

#### CORS Issues
- Verify CORS_ORIGIN setting
- Check frontend domain configuration
- Test with browser developer tools

### 📋 Debug Commands

```bash
# View logs (Heroku)
heroku logs --tail

# View logs (Railway)
railway logs

# View logs (Docker)
docker-compose logs -f

# Check environment variables (Heroku)
heroku config

# Connect to database (Heroku)
heroku run mysql -h hostname -u username -p database_name

# Check Redis connection (Heroku)
heroku redis:cli
```

## Performance Optimization

### 🚀 Production Optimizations
- [ ] Enable Redis caching
- [ ] Configure database connection pooling
- [ ] Set up CDN for static files
- [ ] Enable gzip compression
- [ ] Optimize database queries
- [ ] Set up database indexing

### 📈 Scaling Considerations
- [ ] Use load balancers for multiple instances
- [ ] Set up database read replicas
- [ ] Implement horizontal scaling
- [ ] Configure auto-scaling policies
- [ ] Monitor resource usage

## Support

If you encounter issues during deployment:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Test database and Redis connectivity
4. Ensure all prerequisites are installed
5. Review the deployment platform's documentation

## Quick Reference

### Environment Variables (Required)
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET
NODE_ENV=production
CORS_ORIGIN
```

### Environment Variables (Optional)
```
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
```

### Deployment Commands
```bash
npm run deploy:heroku    # Deploy to Heroku
npm run deploy:railway   # Deploy to Railway
npm run deploy:docker    # Deploy with Docker
```

This checklist ensures a smooth deployment process for the VendorIQ backend API.