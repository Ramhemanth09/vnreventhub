const mongoose = require('mongoose');

let isDBConnected = false;

/**
 * Connects to MongoDB using URI from environment variables.
 * Falls back seamlessly to In-Memory mode if no MongoDB instance is running.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_event_management';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    isDBConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isDBConnected = false;
    console.log(`⚡ Notice: Operating in Auto-Seeded In-Memory Mode (All features, Auth & RBAC active).`);
    console.log(`👉 To use MongoDB Atlas: add MONGO_URI to .env`);
  }
};

mongoose.connection.on('connected', () => { isDBConnected = true; });
mongoose.connection.on('disconnected', () => { isDBConnected = false; });

const getDBStatus = () => isDBConnected;

module.exports = connectDB;
module.exports.getDBStatus = getDBStatus;
