const Event = require('../models/Event');
const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');

/**
 * Get all events based on role
 * - USER: only sees 'PUBLISHED' events
 * - ADMIN: can see all events ('DRAFT', 'PUBLISHED', 'CANCELLED')
 */
const getAllEvents = async (userRole = 'USER', query = {}) => {
  const filter = {};

  if (userRole !== 'ADMIN') {
    // Regular students can ONLY view PUBLISHED events
    filter.status = 'PUBLISHED';
  } else if (query.status) {
    // Admins can filter by specific status if requested
    filter.status = query.status;
  }

  const events = await Event.find(filter)
    .sort({ dateTime: 1 })
    .populate('createdBy', 'name email');

  // Compute live active registration counts and available capacity for each event
  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const activeRegistrations = await Registration.countDocuments({
        event: event._id,
        status: 'REGISTERED'
      });

      const eventObj = event.toObject();
      eventObj.registeredCount = activeRegistrations;
      eventObj.availableSeats = Math.max(0, event.capacity - activeRegistrations);
      eventObj.isFull = activeRegistrations >= event.capacity;
      return eventObj;
    })
  );

  return eventsWithStats;
};

/**
 * Get single event by ID
 */
const getEventById = async (eventId, userRole = 'USER') => {
  const event = await Event.findById(eventId).populate('createdBy', 'name email');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // If user is not admin and event is not published, forbid access
  if (userRole !== 'ADMIN' && event.status !== 'PUBLISHED') {
    throw new AppError('Event is not available for public view', 403);
  }

  const activeRegistrations = await Registration.countDocuments({
    event: event._id,
    status: 'REGISTERED'
  });

  const eventObj = event.toObject();
  eventObj.registeredCount = activeRegistrations;
  eventObj.availableSeats = Math.max(0, event.capacity - activeRegistrations);
  eventObj.isFull = activeRegistrations >= event.capacity;

  return eventObj;
};

/**
 * Create a new event (ADMIN only)
 */
const createEvent = async (eventData, adminId) => {
  const event = await Event.create({
    ...eventData,
    createdBy: adminId
  });
  return event;
};

/**
 * Update event details (ADMIN only)
 */
const updateEvent = async (eventId, updateData) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // If capacity is being reduced, ensure it is not less than currently registered students
  if (updateData.capacity) {
    const activeRegistrations = await Registration.countDocuments({
      event: eventId,
      status: 'REGISTERED'
    });

    if (updateData.capacity < activeRegistrations) {
      throw new AppError(
        `Cannot reduce capacity to ${updateData.capacity}. There are already ${activeRegistrations} active registrations.`,
        400
      );
    }
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
    new: true,
    runValidators: true
  });

  return updatedEvent;
};

/**
 * Publish an event (ADMIN only)
 */
const publishEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.status === 'PUBLISHED') {
    throw new AppError('Event is already published', 400);
  }

  event.status = 'PUBLISHED';
  await event.save();
  return event;
};

/**
 * Cancel an event (ADMIN only)
 * Note: Cancelling an event flags it so no new registrations can take place.
 */
const cancelEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.status === 'CANCELLED') {
    throw new AppError('Event is already cancelled', 400);
  }

  event.status = 'CANCELLED';
  await event.save();
  return event;
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent
};
