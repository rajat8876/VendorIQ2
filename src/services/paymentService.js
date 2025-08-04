// services/paymentService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Subscription } = require('../models');

class PaymentService {
  constructor() {
    // Only initialize Razorpay if credentials are available
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    } else {
      console.warn('Razorpay credentials not found. Payment features will be disabled.');
      this.razorpay = null;
    }
  }
  
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    if (!this.razorpay) {
      throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    
    try {
      const order = await this.razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency,
        receipt,
        notes
      });
      
      return order;
    } catch (error) {
      throw new Error(`Payment order creation failed: ${error.message}`);
    }
  }
  
  verifyPaymentSignature(orderId, paymentId, signature) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_SECRET environment variable.');
    }
    
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === signature;
  }
  
  async processSubscription(userId, planName, duration, paymentId) {
    const plans = {
      basic: { monthly: 200, yearly: 2000 },
      premium: { monthly: 300, yearly: 3000 }
    };
    
    const amount = plans[planName][duration];
    const durationMonths = duration === 'yearly' ? 12 : 1;
    
    const subscription = await Subscription.create({
      user_id: userId,
      plan_name: planName,
      amount,
      payment_id: paymentId,
      starts_at: new Date(),
      ends_at: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000)
    });
    
    return subscription;
  }
}

module.exports = new PaymentService();