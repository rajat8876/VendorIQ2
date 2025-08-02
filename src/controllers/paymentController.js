// Payment Controller
// Handles Razorpay integration and subscription management

const paymentService = require('../services/paymentService');
const { User, Subscription } = require('../models');

class PaymentController {
  async createOrder(req, res) {
    try {
      const { plan, duration } = req.body;
      
      const plans = {
        basic: { monthly: 200, yearly: 2000 },
        premium: { monthly: 300, yearly: 3000 }
      };
      
      if (!plans[plan] || !plans[plan][duration]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan or duration'
        });
      }
      
      const amount = plans[plan][duration];
      const receipt = `order_${req.userId}_${Date.now()}`;
      
      const order = await paymentService.createOrder(amount, 'INR', receipt, {
        user_id: req.userId,
        plan,
        duration
      });
      
      res.json({
        success: true,
        data: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: error.message
      });
    }
  }
  
  async verifyPayment(req, res) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
        duration
      } = req.body;
      
      const isValid = paymentService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }
      
      // Process subscription
      const subscription = await paymentService.processSubscription(
        req.userId,
        plan,
        duration,
        razorpay_payment_id
      );
      
      // Update user subscription status
      await User.update(
        { 
          subscription_status: 'active',
          last_payment_at: new Date()
        },
        { where: { id: req.userId } }
      );
      
      res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        data: subscription
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
    }
  }
  
  async getSubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.findAll({
        where: { user_id: req.userId },
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscriptions',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController();