// services/smsService.js
const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Initialize Twilio client if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }
  
  async sendOTP(phoneNumber, otp) {
    try {
      if (!this.client) {
        // For development/testing - log OTP instead of sending
        console.log(`📱 SMS OTP for ${phoneNumber}: ${otp}`);
        return {
          success: true,
          message: 'OTP logged to console (development mode)',
          sid: 'dev_' + Date.now()
        };
      }

      const message = await this.client.messages.create({
        body: `Your VendorIQ verification code is: ${otp}. Valid for 5 minutes.`,
        from: this.fromNumber,
        to: phoneNumber
      });
      
      return message;
    } catch (error) {
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }
  
  async sendNotification(phoneNumber, message) {
    try {
      if (!this.client) {
        console.log(`📱 SMS Notification for ${phoneNumber}: ${message}`);
        return {
          success: true,
          message: 'Notification logged to console (development mode)',
          sid: 'dev_' + Date.now()
        };
      }

      const sms = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
      
      return sms;
    } catch (error) {
      throw new Error(`SMS notification failed: ${error.message}`);
    }
  }
}

module.exports = new SMSService();