const registrationService = require('../services/registration.service');

/**
 * Register Current Student for an Event
 * POST /api/registrations/events/:eventId/register
 */
const registerForEvent = async (req, res, next) => {
  try {
    const registration = await registrationService.registerForEvent(
      req.user._id,
      req.params.eventId
    );

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        registration
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Student's Registrations
 * GET /api/registrations/my
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.getUserRegistrations(
      req.user._id
    );

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: {
        registrations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Own Registration
 * PATCH /api/registrations/:id/cancel
 */
const cancelMyRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.cancelUserRegistration(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Registration successfully cancelled',
      data: {
        registration
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get All Campus Registrations
 * GET /api/admin/registrations
 */
const getAllRegistrationsAdmin = async (req, res, next) => {
  try {
    const registrations = await registrationService.getAllRegistrationsAdmin(
      req.query
    );

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: {
        registrations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Registration Status
 * PATCH /api/admin/registrations/:id/status
 */
const updateRegistrationStatusAdmin = async (req, res, next) => {
  try {
    const registration =
      await registrationService.updateRegistrationStatusAdmin(
        req.params.id,
        req.body.status
      );

    res.status(200).json({
      success: true,
      message: 'Registration status updated successfully',
      data: {
        registration
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelMyRegistration,
  getAllRegistrationsAdmin,
  updateRegistrationStatusAdmin
};
