// Service Request Routes
// Routes for service request CRUD operations

const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const responseController = require('../controllers/responseController');
const auth = require('../middleware/auth');
const { validateServiceRequest, validateResponse } = require('../middleware/validation');

// Public routes
router.get('/', serviceRequestController.index);
router.get('/:id', serviceRequestController.show);
router.post('/:id/view', serviceRequestController.incrementView);

// Protected routes
router.use(auth);
router.post('/', validateServiceRequest, serviceRequestController.store);
router.put('/:id', validateServiceRequest, serviceRequestController.update);
router.delete('/:id', serviceRequestController.destroy);
router.patch('/:id/status', serviceRequestController.updateStatus);
router.post('/:id/reopen', serviceRequestController.reopen);

// Response routes
router.get('/:id/responses', responseController.index);
router.post('/:id/responses', validateResponse, responseController.store);
router.put('/responses/:responseId', validateResponse, responseController.update);
router.delete('/responses/:responseId', responseController.destroy);
router.post('/responses/:responseId/select', responseController.select);

module.exports = router;