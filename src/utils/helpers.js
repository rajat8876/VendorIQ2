// Helper Functions
// Common helper functions and utilities

const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Format phone number to international format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 91, add +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If it's 10 digits, add +91
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  return phone;
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid phone number
 */
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+91[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Calculate pagination offset
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {number} Offset for database query
 */
const calculateOffset = (page = 1, limit = 10) => {
  return (page - 1) * limit;
};

/**
 * Format response with pagination
 * @param {Array} data - Data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Formatted response
 */
const formatPaginatedResponse = (data, total, page = 1, limit = 10) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total_items: total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  };
};

/**
 * Sleep function for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  generateOTP,
  generateRandomString,
  formatPhoneNumber,
  isValidEmail,
  isValidPhoneNumber,
  calculateOffset,
  formatPaginatedResponse,
  sleep
};