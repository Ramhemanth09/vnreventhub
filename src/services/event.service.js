const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../config/memoryStore');
const AppError = require('../utils/AppError');

/**
 * Get all events based on role
 */
const getAllEvents = async (userRole = 'USER', query = {}) => {
  if (getDBStatus()) {
    const filter = {};
    if (userRole !== 'ADMIN') {
      filter.status = 'PUBLISHED';
    } else if (query.status) {
      filter.status = query.status;
    }

    const events = await Event.find(filter)
      .sort({ dateTime: 1 })
      .populate('createdBy', 'name email');

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
  } else {
    // In-Memory Mode
    let filtered = memoryStore.events;
    if (userRole !== 'ADMIN') {
      filtered = filtered.filter((e) => e.status === 'PUBLISHED');
    } else if (query.status) {
      filtered = filtered.filter((e) => e.status === query.status);
    }

    return filtered.map((e) => {
      const activeCount = memoryStore.registrations.filter(
        (r) => r.event.toString() === e._id.toString() && r.status === 'REGISTERED'
      ).length;

      return {
        ...e,
        registeredCount: activeCount,
        availableSeats: Math.max(0, e.capacity - activeCount),
        isFull: activeCount >= e.capacity
      };
    });
  }
};

/**
 * Get single event by ID
 */
const getEventById = async (eventId, userRole = 'USER') => {
  if (getDBStatus()) {
    const event = await Event.findById(eventId).populate('createdBy', 'name email');

    if (!event) {
      throw new AppError('Event not found', 404);
    }

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
  } else {
    const event = memoryStore.events.find((e) => e._id.toString() === eventId.toString());
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (userRole !== 'ADMIN' && event.status !== 'PUBLISHED') {
      throw new AppError('Event is not available for public view', 403);
    }

    const activeCount = memoryStore.registrations.filter(
      (r) => r.event.toString() === event._id.toString() && r.status === 'REGISTERED'
    ).length;

    return {
      ...event,
      registeredCount: activeCount,
      availableSeats: Math.max(0, event.capacity - activeCount),
      isFull: activeCount >= event.capacity
    };
  }
};

/**
 * Create a new event (ADMIN only)
 */
const createEvent = async (eventData, adminId) => {
  if (getDBStatus()) {
    const event = await Event.create({
      ...eventData,
      createdBy: adminId
    });
    return event;
  } else {
    const newEvent = {
      _id: memoryStore.generateId(),
      ...eventData,
      status: eventData.status || 'DRAFT',
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.events.push(newEvent);
    return newEvent;
  }
};

/**
 * Update event details (ADMIN only)
 */
const updateEvent = async (eventId, updateData) => {
  if (getDBStatus()) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

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
  } else {
    const index = memoryStore.events.findIndex((e) => e._id.toString() === eventId.toString());
    if (index === -1) {
      throw new AppError('Event not found', 404);
    }

    if (updateData.capacity) {
      const activeCount = memoryStore.registrations.filter(
        (r) => r.event.toString() === eventId.toString() && r.status === 'REGISTERED'
      ).length;

      if (updateData.capacity < activeCount) {
        throw new AppError(
          `Cannot reduce capacity to ${updateData.capacity}. There are already ${activeCount} active registrations.`,
          400
        );
      }
    }

    memoryStore.events[index] = {
      ...memoryStore.events[index],
      ...updateData,
      updatedAt: new Date()
    };

    return memoryStore.events[index];
  }
};

/**
 * Publish an event (ADMIN only)
 */
const publishEvent = async (eventId) => {
  if (getDBStatus()) {
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
  } else {
    const event = memoryStore.events.find((e) => e._id.toString() === eventId.toString());
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status === 'PUBLISHED') {
      throw new AppError('Event is already published', 400);
    }

    event.status = 'PUBLISHED';
    event.updatedAt = new Date();
    return event;
  }
};

/**
 * Cancel an event (ADMIN only)
 */
const cancelEvent = async (eventId) => {
  if (getDBStatus()) {
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
  } else {
    const event = memoryStore.events.find((e) => e._id.toString() === eventId.toString());
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status === 'CANCELLED') {
      throw new AppError('Event is already cancelled', 400);
    }

    event.status = 'CANCELLED';
    event.updatedAt = new Date();
    return event;
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent
};
