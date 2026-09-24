const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const {
  registerEventValidator,
  registrationIdValidator
} = require('../validators/registration.validator');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

// All student registration routes require authentication
router.use(protect);

// POST /api/registrations/events/:eventId/register
router.post(
  '/events/:eventId/register',
  registerEventValidator,
  validate,
  registrationController.registerForEvent
);

// GET /api/registrations/my
router.get('/my', registrationController.getMyRegistrations);

// PATCH /api/registrations/:id/cancel
router.patch(
  '/:id/cancel',
  registrationIdValidator,
  validate,
  registrationController.cancelMyRegistration
);

module.exports = router;
