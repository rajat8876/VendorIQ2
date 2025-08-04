# VendorIQ Backend Deployment Guide

This guide covers deployment options for the VendorIQ backend API on various platforms.

## Prerequisites

- Node.js 18+ installed locally
- MySQL database (local or cloud)
- Redis instance (optional but recommended)
- Environment variables configured

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vendoriq
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis Configuration (Optional)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Payment Integration (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMS Service (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## Deployment Options

### 1. Heroku Deployment

#### Quick Deploy
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

#### Manual Deployment

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add Database and Redis**
   ```bash
   heroku addons:create jawsdb:kitefin
   heroku addons:create heroku-redis:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
   # Add other optional variables as needed
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run npm run migrate
   ```

### 2. Railway Deployment

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Railway will auto-detect the Node.js project

2. **Add Database Services**
   - Add MySQL service from Railway marketplace
   - Add Redis service (optional)

3. **Configure Environment Variables**
   - Set all required environment variables in Railway dashboard
   - Railway will automatically provide database connection strings

4. **Deploy**
   - Railway automatically deploys on git push
   - Monitor deployment in Railway dashboard

### 3. DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   # .do/app.yaml
   name: vendoriq-backend
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/vendoriq-backend
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: JWT_SECRET
       value: your-jwt-secret
   databases:
   - name: vendoriq-db
     engine: MYSQL
     version: "8"
   ```

3. **Add Environment Variables**
   - Configure all required environment variables in DO dashboard

### 4. AWS EC2 Deployment

1. **Launch EC2 Instance**
   ```bash
   # Connect to your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install MySQL
   sudo apt install mysql-server -y
   
   # Install Redis (optional)
   sudo apt install redis-server -y
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/vendoriq-backend.git
   cd vendoriq-backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   
   # Run migrations
   npm run migrate
   
   # Start with PM2
   pm2 start src/app.js --name "vendoriq-api"
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx -y
   
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/vendoriq
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/vendoriq /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 5. Docker Deployment

1. **Build and Run Locally**
   ```bash
   # Build image
   docker build -t vendoriq-backend .
   
   # Run with docker-compose (includes MySQL and Redis)
   docker-compose up -d
   
   # Or run standalone
   docker run -p 3000:3000 --env-file .env vendoriq-backend
   ```

2. **Deploy to Docker Hub**
   ```bash
   # Tag image
   docker tag vendoriq-backend your-username/vendoriq-backend:latest
   
   # Push to Docker Hub
   docker push your-username/vendoriq-backend:latest
   ```

## Database Setup

### MySQL Database

1. **Local MySQL**
   ```bash
   # Install MySQL
   # Create database
   mysql -u root -p
   CREATE DATABASE vendoriq;
   ```

2. **Cloud MySQL Options**
   - **AWS RDS**: Managed MySQL service
   - **Google Cloud SQL**: Managed MySQL service
   - **PlanetScale**: Serverless MySQL platform
   - **Railway MySQL**: Simple managed MySQL

### Redis Setup (Optional)

1. **Local Redis**
   ```bash
   # Install Redis
   redis-server
   ```

2. **Cloud Redis Options**
   - **Redis Cloud**: Managed Redis service
   - **AWS ElastiCache**: Managed Redis service
   - **Railway Redis**: Simple managed Redis

## Post-Deployment Steps

1. **Run Database Migrations**
   ```bash
   npm run migrate
   ```

2. **Test API Endpoints**
   ```bash
   # Health check
   curl https://your-api-domain.com/health
   
   # API info
   curl https://your-api-domain.com/api
   ```

3. **Configure Domain and SSL**
   - Point your domain to the deployment
   - Set up SSL certificate (Let's Encrypt recommended)

4. **Monitor Application**
   - Set up logging and monitoring
   - Configure alerts for downtime
   - Monitor database performance

## Environment-Specific Configurations

### Production Optimizations

1. **Security**
   - Use strong JWT secrets
   - Enable HTTPS only
   - Configure proper CORS origins
   - Set up rate limiting

2. **Performance**
   - Enable Redis caching
   - Configure database connection pooling
   - Set up CDN for file uploads
   - Enable gzip compression

3. **Monitoring**
   - Set up application monitoring (New Relic, DataDog)
   - Configure log aggregation
   - Set up uptime monitoring

### Scaling Considerations

1. **Horizontal Scaling**
   - Use load balancers
   - Deploy multiple instances
   - Configure session storage in Redis

2. **Database Scaling**
   - Set up read replicas
   - Implement database sharding
   - Use connection pooling

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database credentials
   # Verify database server is running
   # Check firewall settings
   ```

2. **Port Already in Use**
   ```bash
   # Change PORT in environment variables
   # Kill existing processes
   lsof -ti:3000 | xargs kill -9
   ```

3. **File Upload Issues**
   ```bash
   # Check upload directory permissions
   chmod 755 uploads/
   # Verify MAX_FILE_SIZE setting
   ```

### Logs and Debugging

```bash
# View application logs
tail -f logs/app.log

# PM2 logs (if using PM2)
pm2 logs vendoriq-api

# Docker logs
docker logs container-name

# Heroku logs
heroku logs --tail
```

## Support

For deployment issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure database connectivity
4. Test API endpoints after deployment

## Security Checklist

- [ ] Strong JWT secret configured
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload restrictions in place
- [ ] Environment variables not exposed
- [ ] Database access restricted
- [ ] Regular security updates applied

This deployment guide covers the most common deployment scenarios. Choose the option that best fits your infrastructure requirements and budget.