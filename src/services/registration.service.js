const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { getDBStatus } = require('../config/db');
const memoryStore = require('../config/memoryStore');
const AppError = require('../utils/AppError');

/**
 * Register a student for an event
 */
const registerForEvent = async (userId, eventId) => {
  if (getDBStatus()) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status === 'CANCELLED') {
      throw new AppError('Registration failed: This event has been cancelled by the administration.', 400);
    }
    if (event.status === 'DRAFT') {
      throw new AppError('Registration failed: This event is still in draft mode and not open for registration.', 400);
    }

    if (new Date(event.dateTime) <= new Date()) {
      throw new AppError('Registration failed: This event has already occurred.', 400);
    }

    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId
    });

    if (existingRegistration && existingRegistration.status === 'REGISTERED') {
      throw new AppError('You are already registered for this event.', 409);
    }

    const activeCount = await Registration.countDocuments({
      event: eventId,
      status: 'REGISTERED'
    });

    if (activeCount >= event.capacity) {
      throw new AppError(
        `Registration failed: Event has reached its maximum capacity of ${event.capacity} attendees.`,
        409
      );
    }

    let registration;
    if (existingRegistration) {
      existingRegistration.status = 'REGISTERED';
      existingRegistration.registeredAt = new Date();
      registration = await existingRegistration.save();
    } else {
      registration = await Registration.create({
        user: userId,
        event: eventId,
        status: 'REGISTERED'
      });
    }

    await registration.populate('event', 'title dateTime venue status');
    return registration;
  } else {
    // In-Memory Mode
    const event = memoryStore.events.find((e) => e._id.toString() === eventId.toString());
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status === 'CANCELLED') {
      throw new AppError('Registration failed: This event has been cancelled by the administration.', 400);
    }
    if (event.status === 'DRAFT') {
      throw new AppError('Registration failed: This event is still in draft mode and not open for registration.', 400);
    }

    if (new Date(event.dateTime) <= new Date()) {
      throw new AppError('Registration failed: This event has already occurred.', 400);
    }

    const existingReg = memoryStore.registrations.find(
      (r) => r.user.toString() === userId.toString() && r.event.toString() === eventId.toString()
    );

    if (existingReg && existingReg.status === 'REGISTERED') {
      throw new AppError('You are already registered for this event.', 409);
    }

    const activeCount = memoryStore.registrations.filter(
      (r) => r.event.toString() === eventId.toString() && r.status === 'REGISTERED'
    ).length;

    if (activeCount >= event.capacity) {
      throw new AppError(
        `Registration failed: Event has reached its maximum capacity of ${event.capacity} attendees.`,
        409
      );
    }

    let reg;
    if (existingReg) {
      existingReg.status = 'REGISTERED';
      existingReg.registeredAt = new Date();
      reg = existingReg;
    } else {
      reg = {
        _id: memoryStore.generateId(),
        user: userId,
        event: eventId,
        status: 'REGISTERED',
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.registrations.push(reg);
    }

    return {
      ...reg,
      event: {
        _id: event._id,
        title: event.title,
        dateTime: event.dateTime,
        venue: event.venue,
        status: event.status
      }
    };
  }
};

/**
 * View authenticated student's own registrations
 */
const getUserRegistrations = async (userId) => {
  if (getDBStatus()) {
    const registrations = await Registration.find({ user: userId })
      .populate('event', 'title description dateTime venue capacity status')
      .sort({ registeredAt: -1 });

    return registrations;
  } else {
    return memoryStore.registrations
      .filter((r) => r.user.toString() === userId.toString())
      .map((r) => {
        const ev = memoryStore.events.find((e) => e._id.toString() === r.event.toString());
        return {
          ...r,
          event: ev || null
        };
      })
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  }
};

/**
 * Cancel an eligible registration by the student owner
 */
const cancelUserRegistration = async (registrationId, userId) => {
  if (getDBStatus()) {
    const registration = await Registration.findById(registrationId).populate('event');

    if (!registration) {
      throw new AppError('Registration record not found', 404);
    }

    if (registration.user.toString() !== userId.toString()) {
      throw new AppError('Access forbidden: You can only cancel your own registrations.', 403);
    }

    if (registration.status === 'CANCELLED') {
      throw new AppError('This registration has already been cancelled.', 400);
    }

    if (registration.event && new Date(registration.event.dateTime) <= new Date()) {
      throw new AppError('Cannot cancel registration for an event that has already occurred.', 400);
    }

    registration.status = 'CANCELLED';
    await registration.save();

    return registration;
  } else {
    const reg = memoryStore.registrations.find((r) => r._id.toString() === registrationId.toString());

    if (!reg) {
      throw new AppError('Registration record not found', 404);
    }

    if (reg.user.toString() !== userId.toString()) {
      throw new AppError('Access forbidden: You can only cancel your own registrations.', 403);
    }

    if (reg.status === 'CANCELLED') {
      throw new AppError('This registration has already been cancelled.', 400);
    }

    const event = memoryStore.events.find((e) => e._id.toString() === reg.event.toString());
    if (event && new Date(event.dateTime) <= new Date()) {
      throw new AppError('Cannot cancel registration for an event that has already occurred.', 400);
    }

    reg.status = 'CANCELLED';
    reg.updatedAt = new Date();

    return {
      ...reg,
      event
    };
  }
};

/**
 * Admin: View all registrations across the campus
 */
const getAllRegistrationsAdmin = async (query = {}) => {
  if (getDBStatus()) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.eventId) filter.event = query.eventId;

    const registrations = await Registration.find(filter)
      .populate('user', 'name email role')
      .populate('event', 'title dateTime venue capacity status')
      .sort({ registeredAt: -1 });

    return registrations;
  } else {
    let list = memoryStore.registrations;
    if (query.status) list = list.filter((r) => r.status === query.status);
    if (query.eventId) list = list.filter((r) => r.event.toString() === query.eventId.toString());

    return list.map((r) => {
      const u = memoryStore.users.find((user) => user._id.toString() === r.user.toString());
      const ev = memoryStore.events.find((event) => event._id.toString() === r.event.toString());
      return {
        ...r,
        user: u ? { name: u.name, email: u.email, role: u.role } : null,
        event: ev || null
      };
    }).sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
  }
};

/**
 * Admin: Update registration status
 */
const updateRegistrationStatusAdmin = async (registrationId, status) => {
  if (getDBStatus()) {
    const registration = await Registration.findById(registrationId)
      .populate('user', 'name email')
      .populate('event', 'title dateTime');

    if (!registration) {
      throw new AppError('Registration record not found', 404);
    }

    registration.status = status;
    await registration.save();

    return registration;
  } else {
    const reg = memoryStore.registrations.find((r) => r._id.toString() === registrationId.toString());
    if (!reg) {
      throw new AppError('Registration record not found', 404);
    }

    reg.status = status;
    reg.updatedAt = new Date();

    const u = memoryStore.users.find((user) => user._id.toString() === reg.user.toString());
    const ev = memoryStore.events.find((event) => event._id.toString() === reg.event.toString());

    return {
      ...reg,
      user: u ? { name: u.name, email: u.email } : null,
      event: ev || null
    };
  }
};

module.exports = {
  registerForEvent,
  getUserRegistrations,
  cancelUserRegistration,
  getAllRegistrationsAdmin,
  updateRegistrationStatusAdmin
};
