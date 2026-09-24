const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 60 })
    .withMessage('Name cannot exceed 60 characters'),
  body('rollNo')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Roll Number should be between 2 and 20 characters'),
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
    .trim()
    .matches(/^[0-9+\-\s]{8,15}$/)
    .withMessage('Please provide a valid mobile number (e.g. 9876543210)'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('College email is required')
    .isEmail()
    .withMessage('Please provide a valid college email address')
    .normalizeEmail(),
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
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  registerValidator,
  loginValidator
};
