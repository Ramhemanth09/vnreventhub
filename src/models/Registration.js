const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    status: {
      type: String,
      enum: {
        values: ['REGISTERED', 'CANCELLED', 'ATTENDED'],
        message: 'Status must be REGISTERED, CANCELLED, or ATTENDED'
      },
      default: 'REGISTERED'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * Unique Compound Index: (user, event)
 * Enforces at the database level that a single student cannot have multiple registration documents
 * for the same event, preventing duplicate registrations.
 */
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
