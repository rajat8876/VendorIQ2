// Response Controller
// Handles responses to service requests

const { RequestResponse, ServiceRequest, User } = require('../models');
const { Op } = require('sequelize');

class ResponseController {
  async index(req, res) {
    try {
      const { id } = req.params; // request_id
      const { page = 1, limit = 10 } = req.query;
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await RequestResponse.findAndCountAll({
        where: { request_id: id },
        include: [
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'business_name', 'rating', 'is_verified', 'location']
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
        message: 'Failed to fetch responses',
        error: error.message
      });
    }
  }
  
  async store(req, res) {
    try {
      const { id } = req.params; // request_id
      const {
        message,
        contact_info,
        price,
        timeline,
        attachments
      } = req.body;
      
      // Check if request exists and is open
      const serviceRequest = await ServiceRequest.findByPk(id);
      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found'
        });
      }
      
      if (serviceRequest.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'Cannot respond to closed requests'
        });
      }
      
      // Check if user is not the request creator
      if (serviceRequest.created_by === req.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot respond to your own request'
        });
      }
      
      // Check if user already responded
      const existingResponse = await RequestResponse.findOne({
        where: {
          request_id: id,
          responder_id: req.userId
        }
      });
      
      if (existingResponse) {
        return res.status(400).json({
          success: false,
          message: 'You have already responded to this request'
        });
      }
      
      const response = await RequestResponse.create({
        request_id: id,
        responder_id: req.userId,
        message,
        contact_info,
        price,
        timeline,
        attachments: attachments || []
      });
      
      // Increment response count
      await ServiceRequest.increment('response_count', {
        where: { id }
      });
      
      const responseWithRelations = await RequestResponse.findByPk(response.id, {
        include: [
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'business_name', 'rating', 'is_verified', 'location']
          }
        ]
      });
      
      res.status(201).json({
        success: true,
        message: 'Response submitted successfully',
        data: responseWithRelations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to submit response',
        error: error.message
      });
    }
  }
  
  async update(req, res) {
    try {
      const { responseId } = req.params;
      const {
        message,
        contact_info,
        price,
        timeline,
        attachments
      } = req.body;
      
      const response = await RequestResponse.findByPk(responseId);
      
      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Response not found'
        });
      }
      
      // Check if user owns the response
      if (response.responder_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Check if response is not selected
      if (response.is_selected) {
        return res.status(400).json({
          success: false,
          message: 'Cannot edit selected response'
        });
      }
      
      await response.update({
        message,
        contact_info,
        price,
        timeline,
        attachments: attachments || []
      });
      
      const updatedResponse = await RequestResponse.findByPk(responseId, {
        include: [
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'business_name', 'rating', 'is_verified', 'location']
          }
        ]
      });
      
      res.json({
        success: true,
        message: 'Response updated successfully',
        data: updatedResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update response',
        error: error.message
      });
    }
  }
  
  async destroy(req, res) {
    try {
      const { responseId } = req.params;
      
      const response = await RequestResponse.findByPk(responseId);
      
      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Response not found'
        });
      }
      
      // Check if user owns the response
      if (response.responder_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Check if response is not selected
      if (response.is_selected) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete selected response'
        });
      }
      
      await response.destroy();
      
      // Decrement response count
      await ServiceRequest.decrement('response_count', {
        where: { id: response.request_id }
      });
      
      res.json({
        success: true,
        message: 'Response deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete response',
        error: error.message
      });
    }
  }
  
  async select(req, res) {
    try {
      const { responseId } = req.params;
      
      const response = await RequestResponse.findByPk(responseId, {
        include: [
          {
            model: ServiceRequest,
            as: 'request'
          }
        ]
      });
      
      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Response not found'
        });
      }
      
      // Check if user owns the request
      if (response.request.created_by !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Only request creator can select responses'
        });
      }
      
      // Check if request is still open
      if (response.request.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'Cannot select response for closed request'
        });
      }
      
      // Unselect all other responses for this request
      await RequestResponse.update(
        { is_selected: false },
        { where: { request_id: response.request_id } }
      );
      
      // Select this response
      await response.update({ is_selected: true });
      
      // Update request status to fulfilled
      await ServiceRequest.update(
        { status: 'fulfilled' },
        { where: { id: response.request_id } }
      );
      
      const selectedResponse = await RequestResponse.findByPk(responseId, {
        include: [
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'business_name', 'rating', 'is_verified', 'location']
          }
        ]
      });
      
      res.json({
        success: true,
        message: 'Response selected successfully',
        data: selectedResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to select response',
        error: error.message
      });
    }
  }
}

module.exports = new ResponseController();