# VendorIQ API - Postman Collection Setup Guide

This guide will help you set up and use the Postman collection for testing the VendorIQ API endpoints.

## Files Created

- `VendorIQ_API_Collection.postman_collection.json` - Complete Postman collection with all API endpoints
- `POSTMAN_SETUP.md` - This setup guide

## Import Collection into Postman

1. Open Postman
2. Click "Import" button
3. Select "Upload Files" tab
4. Choose the `VendorIQ_API_Collection.postman_collection.json` file
5. Click "Import"

## Environment Variables Setup

The collection uses two main variables that you need to configure:

### 1. Base URL (`base_url`)
- **Default**: `http://localhost:3000`
- **Description**: The base URL of your VendorIQ API server
- **Usage**: Used in all requests as the server address

### 2. Authentication Token (`token`)
- **Default**: Empty string
- **Description**: JWT token received after successful login
- **Usage**: Used in Authorization header for protected endpoints

### Setting Up Environment Variables

1. In Postman, click on "Environments" in the left sidebar
2. Click "Create Environment" or use "Globals"
3. Add these variables:
   ```
   base_url: http://localhost:3000
   token: (leave empty initially)
   ```
4. Save the environment
5. Select the environment from the dropdown in the top-right corner

## API Testing Workflow

### Step 1: Start Your Server
Make sure your VendorIQ backend server is running:
```bash
npm start
```

### Step 2: Test Health Check
1. Go to "Health Check" → "Health Check"
2. Send the request
3. You should receive a successful response with database status

### Step 3: User Registration & Authentication
1. **Register a new user**:
   - Go to "Authentication" → "Register"
   - Modify the request body with your details
   - Send the request

2. **Send OTP**:
   - Go to "Authentication" → "Send OTP"
   - Use the same email from registration
   - Send the request

3. **Verify OTP**:
   - Go to "Authentication" → "Verify OTP"
   - Enter the OTP received in your email
   - Send the request

4. **Login**:
   - Go to "Authentication" → "Login"
   - Use your email and password
   - Send the request
   - **Important**: Copy the `token` from the response

5. **Set Token Variable**:
   - Copy the JWT token from login response
   - Go to your environment variables
   - Paste the token in the `token` variable
   - Save the environment

### Step 4: Test Protected Endpoints
Now you can test all protected endpoints that require authentication:

- **User Profile**: "Authentication" → "Get User Profile"
- **Service Requests**: All endpoints in "Service Requests" folder
- **File Management**: All endpoints in "File Management" folder
- **Payments**: All endpoints in "Payments" folder

## API Endpoints Overview

### Public Endpoints (No Authentication Required)
- `GET /health` - Health check
- `GET /api` - API information
- `POST /api/auth/register` - User registration
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - User login
- `GET /api/requests` - Get all service requests
- `GET /api/requests/:id` - Get specific request
- `POST /api/requests/:id/view` - Increment view count
- `GET /api/payments` - Payment system info
- `GET /api/users` - Users API info
- `GET /api/industries` - Industries API info
- `GET /api/admin` - Admin API info

### Protected Endpoints (Authentication Required)
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `POST /api/requests` - Create service request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `PATCH /api/requests/:id/status` - Update request status
- `POST /api/requests/:id/reopen` - Reopen request
- `GET /api/requests/:id/responses` - Get request responses
- `POST /api/requests/:id/responses` - Create response
- `PUT /api/requests/responses/:responseId` - Update response
- `DELETE /api/requests/responses/:responseId` - Delete response
- `POST /api/requests/responses/:responseId/select` - Select response
- `GET /api/files` - File system info
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Download/view file
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/subscriptions` - Get user subscriptions

## Sample Request Bodies

### User Registration
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "userType": "client"
}
```

### Create Service Request
```json
{
  "title": "Need Web Development Services",
  "description": "Looking for a developer to build an e-commerce website",
  "categoryId": 1,
  "budget": 5000,
  "timeline": "2 months",
  "location": "New York",
  "requirements": ["React", "Node.js", "Payment Integration"]
}
```

### Create Response
```json
{
  "message": "I can help you with your web development project",
  "proposedBudget": 4500,
  "timeline": "6 weeks",
  "experience": "5 years in React and Node.js development"
}
```

### Create Payment Order
```json
{
  "plan": "premium",
  "duration": "monthly"
}
```

## Tips for Testing

1. **Always test health check first** to ensure the server is running
2. **Complete the authentication flow** before testing protected endpoints
3. **Keep your token updated** - tokens may expire
4. **Use realistic data** in your test requests
5. **Check response status codes** and error messages
6. **Test both success and error scenarios**

## Common Issues

### 401 Unauthorized
- Check if your token is set correctly in environment variables
- Ensure the token hasn't expired
- Verify you're using the correct Authorization header format

### 404 Not Found
- Verify the base_url is correct
- Check if the server is running
- Ensure the endpoint path is correct

### 500 Internal Server Error
- Check server logs for detailed error information
- Verify database connection
- Ensure all required environment variables are set

## Environment Configuration

For different environments, you can create multiple Postman environments:

- **Local Development**: `http://localhost:3000`
- **Staging**: `https://your-staging-url.com`
- **Production**: `https://your-production-url.com`

Switch between environments using the dropdown in Postman's top-right corner.

## Support

If you encounter any issues:
1. Check the server logs
2. Verify your environment variables
3. Ensure the database is connected
4. Review the API documentation in the code comments

Happy testing! 🚀