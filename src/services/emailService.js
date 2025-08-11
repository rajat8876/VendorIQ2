// Email Service
// Handles sending OTPs and notifications via email using Nodemailer

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    
    // Initialize SMTP transporter if valid credentials are provided
    if (process.env.SMTP_HOST && 
        process.env.SMTP_USER && 
        process.env.SMTP_PASS && 
        process.env.SMTP_USER !== 'your-email@gmail.com' && 
        process.env.SMTP_PASS !== 'your-app-password') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendOTP(email, otp) {
    try {
      if (!this.transporter) {
        // For development/testing - log OTP instead of sending
        console.log(`📧 Email OTP for ${email}: ${otp}`);
        return {
          success: true,
          message: 'OTP logged to console (development mode)',
          messageId: 'dev_' + Date.now()
        };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your VendorIQ OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">VendorIQ OTP Verification</h2>
            <p>Your One-Time Password (OTP) for VendorIQ is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP is valid for 5 minutes. Please do not share this code with anyone.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from VendorIQ. Please do not reply to this email.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 OTP email sent successfully to ${email}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  async sendNotification(email, subject, message) {
    try {
      if (!this.transporter) {
        console.log(`📧 Email Notification for ${email}: ${subject} - ${message}`);
        return {
          success: true,
          message: 'Notification logged to console (development mode)',
          messageId: 'dev_' + Date.now()
        };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">VendorIQ Notification</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #007bff;">
              ${message}
            </div>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from VendorIQ. Please do not reply to this email.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Notification email sent successfully to ${email}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send notification email:', error);
      throw new Error('Failed to send notification email');
    }
  }
}

module.exports = new EmailService();