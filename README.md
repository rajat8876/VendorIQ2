# VendorIQ Backend API

🚀 **Production-ready Node.js backend for VendorIQ B2B platform**

VendorIQ is a B2B platform that replaces chaotic WhatsApp trade groups across industries, allowing businesses to post service requests, respond to opportunities, and manage B2B transactions efficiently.

## ✨ Features

- 🔐 **JWT Authentication** with OTP verification
- 👥 **User Management** with business profiles
- 📋 **Dynamic Service Requests** with industry-specific forms
- 💬 **Response System** for B2B opportunities
- 💳 **Payment Integration** with Razorpay
- 📁 **File Upload System** for documents and images
- 🏭 **Industry & Category Management**
- 👑 **Admin Dashboard** with user management
- 📱 **SMS Integration** with Twilio
- ⚡ **Redis Caching** for performance
- 🔒 **Security Middleware** with rate limiting

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Cache**: Redis
- **Authentication**: JWT
- **File Upload**: Multer
- **Payment**: Razorpay
- **SMS**: Twilio
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Quick Deploy

### One-Click Deployment

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Command Line Deployment

```bash
# Clone the repository
git clone https://github.com/your-username/vendoriq-backend.git
cd vendoriq-backend

# Install dependencies
npm install

# Deploy to your preferred platform
npm run deploy:heroku   # Heroku
npm run deploy:railway  # Railway
npm run deploy:docker   # Docker (local)
```

## 📋 Prerequisites

- Node.js 18 or higher
- MySQL database
- Redis (optional but recommended)
- Git

## ⚙️ Environment Setup

1. **Copy environment template**
   ```bash
   cp .env.production .env
   ```

2. **Update environment variables**
   ```env
   # Database (Required)
   DB_HOST=your-database-host
   DB_NAME=vendoriq
   DB_USER=your-username
   DB_PASSWORD=your-password
   
   # JWT (Required)
   JWT_SECRET=your-super-secret-jwt-key
   
   # Application (Required)
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   
   # Payment (Optional)
   RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   
   # SMS (Optional)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-phone
   ```

## 🏃‍♂️ Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.production .env
# Edit .env with your local configuration

# Run database migrations
npm run migrate

# Start development server
npm run dev

# The API will be available at http://localhost:3000
```

## 🐳 Docker Development

```bash
# Start all services (API, MySQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 API Documentation

### Base URL
```
Production: https://your-api-domain.com
Local: http://localhost:3000
```

### Health Check
```bash
GET /health
```

### API Information
```bash
GET /api
```

### Authentication
```bash
POST /api/auth/register     # Register new user
POST /api/auth/login        # Login user
POST /api/auth/verify-otp   # Verify OTP
POST /api/auth/logout       # Logout user
```

### Service Requests
```bash
GET    /api/requests        # Get all requests
POST   /api/requests        # Create new request
GET    /api/requests/:id    # Get specific request
PUT    /api/requests/:id    # Update request
DELETE /api/requests/:id    # Delete request
```

### User Management
```bash
GET    /api/users/profile   # Get user profile
PUT    /api/users/profile   # Update profile
GET    /api/users/requests  # Get user's requests
```

### File Upload
```bash
POST   /api/files/upload    # Upload file
GET    /api/files/:id       # Get file
DELETE /api/files/:id       # Delete file
```

### Payments
```bash
POST   /api/payments/create-order    # Create payment order
POST   /api/payments/verify          # Verify payment
GET    /api/payments/subscriptions   # Get subscriptions
```

## 🔧 Database Schema

The application uses the following main tables:

- **users** - User accounts and business profiles
- **industries** - Industry categories
- **categories** - Service categories within industries
- **form_fields** - Dynamic form field definitions
- **service_requests** - Service requests posted by users
- **request_responses** - Responses to service requests
- **files** - Uploaded files and documents
- **subscriptions** - User subscription records
- **reviews** - User reviews and ratings

## 🚀 Deployment Platforms

### Heroku
```bash
npm run deploy:heroku
```
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Easy database add-ons
- ✅ Built-in monitoring

### Railway
```bash
npm run deploy:railway
```
- ✅ Modern platform
- ✅ Git-based deployments
- ✅ Automatic scaling
- ✅ Built-in databases

### DigitalOcean App Platform
- ✅ Competitive pricing
- ✅ Managed databases
- ✅ Auto-scaling
- ✅ Global CDN

### AWS EC2
- ✅ Full control
- ✅ Custom configurations
- ✅ Enterprise features
- ✅ Scalable infrastructure

### Docker
```bash
npm run deploy:docker
```
- ✅ Local development
- ✅ Consistent environments
- ✅ Easy scaling
- ✅ Container orchestration

## 📊 Monitoring & Logging

### Health Monitoring
```bash
# Check application health
curl https://your-api-domain.com/health

# Expected response
{
  "success": true,
  "message": "VendorIQ Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Application Logs
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Docker
docker-compose logs -f

# PM2 (EC2)
pm2 logs vendoriq-api
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Helmet Security** headers
- **Input Validation** with Joi
- **File Upload Security** with type and size restrictions
- **SQL Injection Protection** via Sequelize ORM
- **Environment Variable Security** for sensitive data

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific endpoints
curl -X GET https://your-api-domain.com/health
curl -X GET https://your-api-domain.com/api
```

## 📈 Performance Optimization

- **Redis Caching** for frequently accessed data
- **Database Indexing** for optimized queries
- **Connection Pooling** for database efficiency
- **Gzip Compression** for reduced payload size
- **Rate Limiting** for resource protection
- **Static File Serving** with Express

## 🔧 Configuration

### Required Environment Variables
```env
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET
NODE_ENV
CORS_ORIGIN
```

### Optional Environment Variables
```env
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials
   - Verify database server is running
   - Check firewall settings

2. **Port Already in Use**
   - Change PORT in environment variables
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

3. **File Upload Issues**
   - Check upload directory permissions: `chmod 755 uploads/`
   - Verify MAX_FILE_SIZE setting

4. **CORS Issues**
   - Verify CORS_ORIGIN matches your frontend domain
   - Check browser developer tools for CORS errors

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node -e "require('./src/config/database').sequelize.authenticate().then(() => console.log('Connected')).catch(console.error)"

# Check Redis connection
node -e "require('./src/config/redis').ping().then(() => console.log('Redis OK')).catch(console.error)"
```

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Comprehensive deployment instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment checklist
- [API Documentation](./API.md) - Detailed API endpoint documentation
- [Database Schema](./SCHEMA.md) - Database structure and relationships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@vendoriq.com
- 📱 Phone: +91-XXXXXXXXXX
- 💬 Discord: [VendorIQ Community](https://discord.gg/vendoriq)
- 📖 Documentation: [docs.vendoriq.com](https://docs.vendoriq.com)

## 🎯 Roadmap

- [ ] Mobile API optimization
- [ ] Advanced analytics dashboard
- [ ] AI-powered matching system
- [ ] WhatsApp Business API integration
- [ ] Multi-language support
- [ ] Advanced notification system

---

**Made with ❤️ for the B2B community**

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template)

**⭐ Star this repository if you find it helpful!**