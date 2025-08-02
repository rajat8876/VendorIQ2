// File Controller
// Handles file upload and management operations

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { File } = require('../models');
const fs = require('fs').promises;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads', req.userId);
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = uuidv4() + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  
  const fileType = req.body.type || 'document';
  
  if (allowedTypes[fileType] && allowedTypes[fileType].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

class FileController {
  async upload(req, res) {
    try {
      const { file } = req;
      const { type = 'document' } = req.body;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const fileRecord = await File.create({
        user_id: req.userId,
        original_name: file.originalname,
        file_name: file.filename,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: type
      });
      
      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          id: fileRecord.id,
          url: `/api/files/${fileRecord.id}`,
          original_name: fileRecord.original_name,
          file_size: fileRecord.file_size
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: error.message
      });
    }
  }
  
  async show(req, res) {
    try {
      const { id } = req.params;
      
      const file = await File.findByPk(id);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      // Check if user has access to file
      if (file.user_id !== req.userId && !file.is_public) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.sendFile(path.resolve(file.file_path));
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve file',
        error: error.message
      });
    }
  }
}

module.exports = {
  FileController: new FileController(),
  upload
};