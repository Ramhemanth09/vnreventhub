const { body, param } = require('express-validator');

const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required'),
  body('dateTime')
    .notEmpty()
    .withMessage('Event date and time is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO format (e.g. YYYY-MM-DDTHH:mm:ssZ)')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be set in the future');
      }
      return true;
    }),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Event venue is required'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer of at least 1'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or CANCELLED')
];

const updateEventValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event description cannot be empty'),
  body('dateTime')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be set in the future');
      }
      return true;
    }),
  body('venue')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event venue cannot be empty'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer of at least 1'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'CANCELLED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or CANCELLED')
];

const eventIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID format')
];

module.exports = {
  createEventValidator,
  updateEventValidator,
  eventIdValidator
};
