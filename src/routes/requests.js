// Service Request Routes
// Routes for service request CRUD operations

const express = require('express');
const router = express.Router();

// Test route to verify connectivity
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Service Requests API is working',
    endpoint: '/api/requests'
  });
});

// Implementation will be added in later phases

module.exports = router;