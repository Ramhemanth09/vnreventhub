const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const {
  createEventValidator,
  updateEventValidator,
  eventIdValidator
} = require('../validators/event.validator');
const { validate } = require('../middleware/validate.middleware');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

// Public & Student Event Discovery
// GET /api/events (Optional auth so ADMIN can view all/filtered, USER sees PUBLISHED only)
router.get('/', optionalAuth, eventController.getEvents);

// GET /api/events/:id
router.get('/:id', optionalAuth, eventIdValidator, validate, eventController.getEventById);

// Admin Event Management Endpoints
router.post(
  '/',
  protect,
  allowRoles('ADMIN'),
  createEventValidator,
  validate,
  eventController.createEvent
);

router.patch(
  '/:id',
  protect,
  allowRoles('ADMIN'),
  updateEventValidator,
  validate,
  eventController.updateEvent
);

router.patch(
  '/:id/publish',
  protect,
  allowRoles('ADMIN'),
  eventIdValidator,
  validate,
  eventController.publishEvent
);

router.patch(
  '/:id/cancel',
  protect,
  allowRoles('ADMIN'),
  eventIdValidator,
  validate,
  eventController.cancelEvent
);

module.exports = router;
