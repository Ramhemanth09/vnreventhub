const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('rollNo')
    .optional({ checkFalsy: true })
    .trim(),
  body('year')
    .optional({ checkFalsy: true })
    .trim(),
  body('branch')
    .optional({ checkFalsy: true })
    .trim(),
  body('section')
    .optional({ checkFalsy: true })
    .trim(),
  body('mobileNo')
    .optional({ checkFalsy: true })
    .trim(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('College email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be either USER or ADMIN')
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  registerValidator,
  loginValidator
};
