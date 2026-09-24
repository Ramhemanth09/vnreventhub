const dotenv = require('dotenv');

// 1. Load environment variables before importing app
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// 2. Initialize Database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      console.log(`🌐 Web Portal available at: http://localhost:${PORT}`);
      console.log(`📚 API Health check at: http://localhost:${PORT}/api/health`);
    });

    // Handle unhandled Promise rejections (e.g. database disconnect)
    process.on('unhandledRejection', (err) => {
      console.error(`💥 UNHANDLED REJECTION! Shutting down...: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught synchronous exceptions
    process.on('uncaughtException', (err) => {
      console.error(`💥 UNCAUGHT EXCEPTION! Shutting down...: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
