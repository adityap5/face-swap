const { body, validationResult } = require('express-validator');

// Sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and scripts
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .trim();
};

// Validation rules
const validationRules = () => {
  return [
    body('name')
      .isLength({ min: 4, max: 30 })
      .withMessage('Name must be between 4 and 30 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces')
      .customSanitizer(sanitizeInput),
    
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .customSanitizer(sanitizeInput),
    
    body('phone')
      .matches(/^\d{10}$/)
      .withMessage('Phone number must be exactly 10 digits')
      .customSanitizer(sanitizeInput),
    
    body('terms')
      .equals('on')
      .withMessage('You must accept the terms and conditions')
  ];
};

// Check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('index', {
      errors: errors.array(),
      formData: req.body
    });
  }
  next();
};

// Image validation
const validateImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 2 * 1024 * 1024; 

  if (!file) {
    return { isValid: false, error: 'Image is required' };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Only JPG, JPEG, and PNG images are allowed' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 2MB' };
  }

  return { isValid: true };
};

module.exports = {
  validationRules,
  validate,
  validateImage,
  sanitizeInput
};