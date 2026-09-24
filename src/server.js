const dotenv = require('dotenv');

// 1. Load environment variables
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// 2. Start HTTP Server immediately
const server = app.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 Web Portal URL:    http://localhost:${PORT}`);
  console.log(`📚 API Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`===============================================================\n`);
});

// 3. Connect to MongoDB
connectDB();

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Promise Rejection: ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`💥 Uncaught Exception: ${err.message}`);
});
