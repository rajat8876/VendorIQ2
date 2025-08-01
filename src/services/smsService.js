// SMS Service
// Twilio integration for OTP and notifications

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

  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - Phone number in +91XXXXXXXXXX format
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<Object>} SMS sending result
   */
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

      const message = `Your VendorIQ verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      return {
        success: true,
        message: 'OTP sent successfully',
        sid: result.sid
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      
      // Fallback to console logging in case of SMS failure
      console.log(`📱 SMS FALLBACK - OTP for ${phoneNumber}: ${otp}`);
      
      return {
        success: false,
        message: 'SMS sending failed, OTP logged to console',
        error: error.message
      };
    }
  }

  /**
   * Send notification SMS
   * @param {string} phoneNumber - Phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>} SMS sending result
   */
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

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      return {
        success: true,
        message: 'Notification sent successfully',
        sid: result.sid
      };
    } catch (error) {
      console.error('SMS notification failed:', error);
      return {
        success: false,
        message: 'SMS notification failed',
        error: error.message
      };
    }
  }

  /**
   * Send bulk SMS notifications
   * @param {Array} recipients - Array of {phoneNumber, message} objects
   * @returns {Promise<Array>} Array of sending results
   */
  async sendBulkNotifications(recipients) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendNotification(recipient.phoneNumber, recipient.message);
      results.push({
        phoneNumber: recipient.phoneNumber,
        ...result
      });
      
      // Add small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Is valid phone number
   */
  isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\+91[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
  }
}

module.exports = new SMSService();