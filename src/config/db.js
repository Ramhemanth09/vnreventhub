const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI provided in environment variables.
 * Handles initial connection and runtime connection events.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_event_management';
    
    const conn = await mongoose.connect(mongoURI, {
      // Modern mongoose options are enabled by default
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Stop process on database connection failure
  }
};

module.exports = connectDB;
