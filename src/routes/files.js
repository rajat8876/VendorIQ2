// File Routes
// Routes for file upload and management

const express = require('express');
const router = express.Router();
const { FileController, upload } = require('../controllers/fileController');
const auth = require('../middleware/auth');

// All file routes require authentication
router.use(auth);

// File upload route
router.post('/upload', upload.single('file'), FileController.upload);

// File download/view route
router.get('/:id', FileController.show);

// File listing route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'File Upload System - Phase 8',
    endpoints: {
      upload: 'POST /api/files/upload',
      download: 'GET /api/files/:id'
    }
  });
});

module.exports = router;