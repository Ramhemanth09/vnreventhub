const eventService = require('../services/event.service');

/**
 * Get All Events
 * GET /api/events
 */
const getEvents = async (req, res, next) => {
  try {
    const role = req.user ? req.user.role : 'USER';
    const events = await eventService.getAllEvents(role, req.query);

    res.status(200).json({
      success: true,
      count: events.length,
      data: {
        events
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Event By ID
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const role = req.user ? req.user.role : 'USER';
    const event = await eventService.getEventById(req.params.id, role);

    res.status(200).json({
      success: true,
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create New Event (ADMIN)
 * POST /api/events
 */
const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Event (ADMIN)
 * PATCH /api/events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish Event (ADMIN)
 * PATCH /api/events/:id/publish
 */
const publishEvent = async (req, res, next) => {
  try {
    const event = await eventService.publishEvent(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event published successfully',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Event (ADMIN)
 * PATCH /api/events/:id/cancel
 */
const cancelEvent = async (req, res, next) => {
  try {
    const event = await eventService.cancelEvent(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent
};
