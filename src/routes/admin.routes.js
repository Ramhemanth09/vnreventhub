const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const {
  updateRegistrationStatusValidator
} = require('../validators/registration.validator');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

// All Admin routes require Authentication + ADMIN Role
router.use(protect);
router.use(allowRoles('ADMIN'));

// GET /api/admin/registrations
router.get('/registrations', registrationController.getAllRegistrationsAdmin);

// PATCH /api/admin/registrations/:id/status
router.patch(
  '/registrations/:id/status',
  updateRegistrationStatusValidator,
  validate,
  registrationController.updateRegistrationStatusAdmin
);

module.exports = router;
