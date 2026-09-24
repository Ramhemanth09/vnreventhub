const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    rollNo: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    year: {
      type: String,
      trim: true,
      default: ''
    },
    branch: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    mobileNo: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Please provide your college email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid college email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Never return password field by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: 'Role must be either USER or ADMIN'
      },
      default: 'USER'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
