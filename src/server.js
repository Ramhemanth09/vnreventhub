const dotenv = require('dotenv');

// 1. Load environment variables
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// 2. Start HTTP Server with explicit 0.0.0.0 binding for Cloud Providers (Render, Railway, Heroku, Docker)
const server = app.listen(PORT, HOST, () => {
  console.log(`\n===============================================================`);
  console.log(`🚀 Production Server running on http://${HOST}:${PORT}`);
  console.log(`🌐 Web Portal & API live on Port ${PORT}`);
  console.log(`📚 Health check available at: /api/health`);
  console.log(`===============================================================\n`);
});

// 3. Connect to MongoDB (with automatic dual-mode fallback)
connectDB();

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Promise Rejection: ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`💥 Uncaught Exception: ${err.message}`);
});

module.exports = server;
