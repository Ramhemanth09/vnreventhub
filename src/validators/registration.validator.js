const { param, body } = require('express-validator');

const registerEventValidator = [
  param('eventId')
    .isMongoId()
    .withMessage('Invalid event ID format')
];

const registrationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid registration ID format')
];

const updateRegistrationStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid registration ID format'),
  body('status')
    .notEmpty()
    .withMessage('Registration status is required')
    .isIn(['REGISTERED', 'CANCELLED', 'ATTENDED'])
    .withMessage('Status must be REGISTERED, CANCELLED, or ATTENDED')
];

module.exports = {
  registerEventValidator,
  registrationIdValidator,
  updateRegistrationStatusValidator
};
