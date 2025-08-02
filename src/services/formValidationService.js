// Form Validation Service
// Validates dynamic form fields based on category configuration

const { FormField } = require('../models');

class FormValidationService {
  async validateDynamicFields(categoryId, customFields) {
    try {
      // Get form fields for the category
      const formFields = await FormField.findAll({
        where: {
          category_id: categoryId,
          is_active: true
        }
      });

      const errors = [];
      const validatedFields = {};

      // Validate each required field
      for (const field of formFields) {
        const fieldValue = customFields[field.field_name];
        
        // Check required fields
        if (field.is_required && (!fieldValue || fieldValue.toString().trim() === '')) {
          errors.push({
            field: field.field_name,
            message: `${field.field_label} is required`
          });
          continue;
        }

        // Skip validation if field is not provided and not required
        if (!fieldValue) {
          continue;
        }

        // Validate field type
        const validationResult = this.validateFieldType(field, fieldValue);
        if (!validationResult.isValid) {
          errors.push({
            field: field.field_name,
            message: validationResult.message
          });
          continue;
        }

        // Apply validation rules if any
        if (field.validation_rules) {
          const rulesValidation = this.validateFieldRules(field, fieldValue);
          if (!rulesValidation.isValid) {
            errors.push({
              field: field.field_name,
              message: rulesValidation.message
            });
            continue;
          }
        }

        validatedFields[field.field_name] = fieldValue;
      }

      return {
        isValid: errors.length === 0,
        errors,
        validatedFields
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{ field: 'general', message: 'Validation service error' }],
        validatedFields: {}
      };
    }
  }

  validateFieldType(field, value) {
    switch (field.field_type) {
      case 'number':
        if (isNaN(value)) {
          return {
            isValid: false,
            message: `${field.field_label} must be a valid number`
          };
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return {
            isValid: false,
            message: `${field.field_label} must be a valid date`
          };
        }
        break;

      case 'select':
      case 'radio':
        if (field.options && field.options.length > 0) {
          const validOptions = field.options.map(opt => opt.value || opt);
          if (!validOptions.includes(value)) {
            return {
              isValid: false,
              message: `${field.field_label} must be one of: ${validOptions.join(', ')}`
            };
          }
        }
        break;

      case 'checkbox':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          return {
            isValid: false,
            message: `${field.field_label} must be true or false`
          };
        }
        break;

      default:
        // text, textarea - no specific validation needed
        break;
    }

    return { isValid: true };
  }

  validateFieldRules(field, value) {
    const rules = field.validation_rules;

    // Min length validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      return {
        isValid: false,
        message: `${field.field_label} must be at least ${rules.minLength} characters long`
      };
    }

    // Max length validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return {
        isValid: false,
        message: `${field.field_label} must not exceed ${rules.maxLength} characters`
      };
    }

    // Min value validation (for numbers)
    if (rules.min && field.field_type === 'number' && parseFloat(value) < rules.min) {
      return {
        isValid: false,
        message: `${field.field_label} must be at least ${rules.min}`
      };
    }

    // Max value validation (for numbers)
    if (rules.max && field.field_type === 'number' && parseFloat(value) > rules.max) {
      return {
        isValid: false,
        message: `${field.field_label} must not exceed ${rules.max}`
      };
    }

    // Pattern validation
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value.toString())) {
        return {
          isValid: false,
          message: rules.patternMessage || `${field.field_label} format is invalid`
        };
      }
    }

    return { isValid: true };
  }
}

module.exports = {
  validateDynamicFields: async (categoryId, customFields) => {
    const service = new FormValidationService();
    return await service.validateDynamicFields(categoryId, customFields);
  }
};