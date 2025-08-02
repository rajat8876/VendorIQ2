// services/paymentService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Subscription } = require('../models');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
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