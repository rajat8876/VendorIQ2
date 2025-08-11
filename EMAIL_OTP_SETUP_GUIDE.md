# Email OTP Setup and Testing Guide

## Issue Identified

The email OTP functionality is currently in **development mode** because the SMTP credentials in your `.env` file are still set to placeholder values. The system detects this and falls back to console logging instead of actually sending emails.

## Current Status

✅ **Working**: Console logging mode (OTPs are logged to server console)  
✅ **Working**: Complete authentication flow with OTP verification
✅ **Working**: User registration with OTP generation
✅ **Working**: JWT token generation after successful verification
❌ **Not Working**: Actual email sending via SMTP

## Fix Instructions

### Step 1: Configure Gmail SMTP (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update your `.env` file**:
```env
# Replace these lines in your .env file:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### Step 2: Alternative SMTP Providers

If you prefer not to use Gmail, here are other options:

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid (Professional)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailtrap (Testing)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

## Testing Email OTP

### Method 1: Console Logging (Current Setup)

1. **Send OTP Request** in Postman:
   ```
   POST http://localhost:3000/api/auth/send-otp
   Content-Type: application/json
   
   {
     "email": "test@example.com"
   }
   ```

2. **Check Server Console** for the OTP:
   ```
   📧 Email OTP for test@example.com: 123456
   ```

3. **Verify OTP** in Postman:
   ```
   POST http://localhost:3000/api/auth/verify-otp
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "otp": "123456"
   }
   ```

### Method 2: Actual Email Sending (After SMTP Setup)

1. **Update `.env` file** with real SMTP credentials
2. **Restart the server**: `npm start`
3. **Send OTP to your real email**:
   ```
   POST http://localhost:3000/api/auth/send-otp
   Content-Type: application/json
   
   {
     "email": "your-real-email@gmail.com"
   }
   ```
4. **Check your email inbox** for the OTP
5. **Verify with received OTP**

## Troubleshooting

### Common Issues

#### 1. "Failed to send OTP email" Error
**Causes:**
- Invalid SMTP credentials
- Gmail security settings
- Network/firewall issues

**Solutions:**
- Double-check SMTP credentials
- Use App Password for Gmail (not regular password)
- Check if "Less secure app access" is enabled (not recommended)

#### 2. OTP Not Received
**Check:**
- Spam/Junk folder
- Email address spelling
- Server console for error messages

#### 3. "OTP expired or invalid"
**Causes:**
- OTP older than 5 minutes
- Wrong OTP entered
- Server restart (clears in-memory storage)

### Debug Mode

To see detailed email sending logs, check your server console when sending OTP. You'll see:

```bash
# Development mode (current):
📧 Email OTP for user@example.com: 123456

# Production mode (after SMTP setup):
📧 OTP email sent successfully to user@example.com
```

## Testing Workflow

### Quick Test (Console Mode)
1. Start server: `npm start`
2. Send OTP via Postman
3. Check server console for OTP
4. Verify OTP via Postman

### Full Test (Email Mode)
1. Configure SMTP in `.env`
2. Restart server
3. Send OTP to real email
4. Check email inbox
5. Verify received OTP

## Email Template Preview

When properly configured, users will receive a professional email like this:

```
Subject: Your VendorIQ OTP Code

VendorIQ OTP Verification

Your One-Time Password (OTP) for VendorIQ is:

    123456

This OTP is valid for 5 minutes. Please do not share this code with anyone.

If you didn't request this OTP, please ignore this email.
```

## Security Features

✅ **OTP Expiration**: 5 minutes  
✅ **Single Use**: OTP deleted after verification  
✅ **Rate Limiting**: Prevents spam  
✅ **Secure Storage**: Redis/in-memory with TTL  
✅ **HTML Email**: Professional formatting  

## Next Steps

1. **For Development**: Continue using console logging mode
2. **For Production**: Set up proper SMTP credentials
3. **For Testing**: Use Mailtrap or similar testing service
4. **For Scale**: Consider SendGrid, AWS SES, or similar services

## Support

If you encounter issues:
1. Check server console logs
2. Verify SMTP credentials
3. Test with different email providers
4. Use Mailtrap for safe testing

The current setup is working correctly in development mode - OTPs are being generated and can be verified using the console output!