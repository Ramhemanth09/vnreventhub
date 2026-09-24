const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const adminRoutes = require('./routes/admin.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// 1. Core Middlewares
app.use(
  cors({
    origin: true, // Allow frontend origin
    credentials: true // Allow cookies across origins
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Serve Static Frontend Web Portal
app.use(express.static(path.join(__dirname, '../public')));

// 3. API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campus Event Management API is healthy and running',
    timestamp: new Date().toISOString()
  });
});

// 4. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// 5. 404 Handler for Unmatched API Routes
app.use(notFound);

// 6. Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
