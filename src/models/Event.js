const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    dateTime: {
      type: Date,
      required: [true, 'Event date and time is required']
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
        message: 'Status must be DRAFT, PUBLISHED, or CANCELLED'
      },
      default: 'DRAFT'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

// Virtual index for sorting upcoming events
eventSchema.index({ dateTime: 1, status: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
