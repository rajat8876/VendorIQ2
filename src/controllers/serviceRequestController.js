// Service Request Controller
// Handles CRUD operations for service requests, search, and filtering

const { ServiceRequest, User, Industry, Category, RequestResponse } = require('../models');
const { Op } = require('sequelize');
const { validateDynamicFields } = require('../services/formValidationService');

class ServiceRequestController {
  async index(req, res) {
    try {
      const {
        page = 1,
        limit = 15,
        industry,
        category,
        location,
        status = 'open',
        search
      } = req.query;
      
      const offset = (page - 1) * limit;
      const where = {};
      
      if (industry) where.industry_id = industry;
      if (category) where.category_id = category;
      if (status) where.status = status;
      if (location) {
        where.location = {
          [Op.like]: `%${location}%`
        };
      }
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows } = await ServiceRequest.findAndCountAll({
        where,
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { 
            model: User, 
            as: 'creator',
            attributes: ['id', 'business_name', 'rating', 'is_verified']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: {
          current_page: parseInt(page),
          data: rows,
          per_page: parseInt(limit),
          total: count,
          last_page: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch requests',
        error: error.message
      });
    }
  }
  
  async store(req, res) {
    try {
      const {
        title,
        description,
        industry_id,
        category_id,
        location,
        budget,
        deadline,
        custom_fields
      } = req.body;
      
      // Validate user can post requests
      const user = await User.findByPk(req.userId);
      if (!user.canPostRequests()) {
        return res.status(403).json({
          success: false,
          message: 'Subscription required to post requests'
        });
      }
      
      // Validate dynamic fields
      if (custom_fields && category_id) {
        const validationResult = await validateDynamicFields(category_id, custom_fields);
        if (!validationResult.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.errors
          });
        }
      }
      
      const serviceRequest = await ServiceRequest.create({
        title,
        description,
        industry_id,
        category_id,
        location,
        budget,
        deadline,
        custom_fields: custom_fields || {},
        created_by: req.userId
      });
      
      const requestWithRelations = await ServiceRequest.findByPk(serviceRequest.id, {
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { model: User, as: 'creator' }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Request created successfully',
        data: requestWithRelations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create request',
        error: error.message
      });
    }
  }
  
  async show(req, res) {
    try {
      const { id } = req.params;
      
      const serviceRequest = await ServiceRequest.findByPk(id, {
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { model: User, as: 'creator' },
          {
            model: RequestResponse,
            as: 'responses',
            include: [{ model: User, as: 'responder' }]
          }
        ]
      });
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      res.json({
        success: true,
        data: serviceRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch request',
        error: error.message
      });
    }
  }
  
  async incrementView(req, res) {
    try {
      const { id } = req.params;
      
      await ServiceRequest.increment('view_count', {
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'View count updated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update view count',
        error: error.message
      });
    }
  }
  
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        industry_id,
        category_id,
        location,
        budget,
        deadline,
        custom_fields
      } = req.body;
      
      const serviceRequest = await ServiceRequest.findByPk(id);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check if user owns the request
      if (serviceRequest.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      await serviceRequest.update({
        title,
        description,
        industry_id,
        category_id,
        location,
        budget,
        deadline,
        custom_fields: custom_fields || {}
      });
      
      const updatedRequest = await ServiceRequest.findByPk(id, {
        include: [
          { model: Industry, as: 'industry' },
          { model: Category, as: 'category' },
          { model: User, as: 'creator' }
        ]
      });
      
      res.json({
        success: true,
        message: 'Request updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update request',
        error: error.message
      });
    }
  }
  
  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      const serviceRequest = await ServiceRequest.findByPk(id);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check if user owns the request
      if (serviceRequest.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      await serviceRequest.destroy();
      
      res.json({
        success: true,
        message: 'Request deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete request',
        error: error.message
      });
    }
  }
  
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const serviceRequest = await ServiceRequest.findByPk(id);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check if user owns the request
      if (serviceRequest.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      await serviceRequest.update({ status });
      
      res.json({
        success: true,
        message: 'Request status updated successfully',
        data: serviceRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update request status',
        error: error.message
      });
    }
  }
  
  async reopen(req, res) {
    try {
      const { id } = req.params;
      
      const serviceRequest = await ServiceRequest.findByPk(id);
      
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
      
      // Check if user owns the request
      if (serviceRequest.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      await serviceRequest.update({ status: 'open' });
      
      res.json({
        success: true,
        message: 'Request reopened successfully',
        data: serviceRequest
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to reopen request',
        error: error.message
      });
    }
  }
}

module.exports = new ServiceRequestController();