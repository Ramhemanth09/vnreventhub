const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');

/**
 * Register a student for an event
 * Enforces all Business Rules:
 * - Event must exist and be in PUBLISHED status
 * - Event must be upcoming (not in the past)
 * - Registrations must NOT exceed available capacity
 * - Compound unique check prevents duplicate active registrations
 */
const registerForEvent = async (userId, eventId) => {
  // 1. Verify Event existence
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // 2. Business Rule: Status validation (Cannot register for CANCELLED or DRAFT events)
  if (event.status === 'CANCELLED') {
    throw new AppError('Registration failed: This event has been cancelled by the administration.', 400);
  }
  if (event.status === 'DRAFT') {
    throw new AppError('Registration failed: This event is still in draft mode and not open for registration.', 400);
  }

  // 3. Business Rule: Event timing validation
  if (new Date(event.dateTime) <= new Date()) {
    throw new AppError('Registration failed: This event has already occurred.', 400);
  }

  // 4. Business Rule: Check for existing registration by this user
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId
  });

  if (existingRegistration && existingRegistration.status === 'REGISTERED') {
    throw new AppError('You are already registered for this event.', 409);
  }

  // 5. Business Rule: Capacity enforcement
  // Count only actively registered participants (exclude cancelled)
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

  // 6. Create or re-activate registration
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

  // Populate event details for immediate response
  await registration.populate('event', 'title dateTime venue status');
  return registration;
};

/**
 * View authenticated student's own registrations
 * Business Rule: Users can ONLY access their own resources
 */
const getUserRegistrations = async (userId) => {
  const registrations = await Registration.find({ user: userId })
    .populate('event', 'title description dateTime venue capacity status')
    .sort({ registeredAt: -1 });

  return registrations;
};

/**
 * Cancel an eligible registration by the student owner
 * Business Rules:
 * - User must be the owner of the registration (403 Forbidden if not)
 * - Registration must not be already cancelled
 * - Event must not be in the past or cancelled
 */
const cancelUserRegistration = async (registrationId, userId) => {
  const registration = await Registration.findById(registrationId).populate('event');

  if (!registration) {
    throw new AppError('Registration record not found', 404);
  }

  // Ownership verification
  if (registration.user.toString() !== userId.toString()) {
    throw new AppError('Access forbidden: You can only cancel your own registrations.', 403);
  }

  // Check if already cancelled
  if (registration.status === 'CANCELLED') {
    throw new AppError('This registration has already been cancelled.', 400);
  }

  // Check if event is in the past
  if (registration.event && new Date(registration.event.dateTime) <= new Date()) {
    throw new AppError('Cannot cancel registration for an event that has already occurred.', 400);
  }

  registration.status = 'CANCELLED';
  await registration.save();

  return registration;
};

/**
 * Admin: View all registrations across the campus
 */
const getAllRegistrationsAdmin = async (query = {}) => {
  const filter = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.eventId) {
    filter.event = query.eventId;
  }

  const registrations = await Registration.find(filter)
    .populate('user', 'name email role')
    .populate('event', 'title dateTime venue capacity status')
    .sort({ registeredAt: -1 });

  return registrations;
};

/**
 * Admin: Update registration status (e.g. mark ATTENDED or CANCELLED)
 */
const updateRegistrationStatusAdmin = async (registrationId, status) => {
  const registration = await Registration.findById(registrationId)
    .populate('user', 'name email')
    .populate('event', 'title dateTime');

  if (!registration) {
    throw new AppError('Registration record not found', 404);
  }

  registration.status = status;
  await registration.save();

  return registration;
};

module.exports = {
  registerForEvent,
  getUserRegistrations,
  cancelUserRegistration,
  getAllRegistrationsAdmin,
  updateRegistrationStatusAdmin
};
