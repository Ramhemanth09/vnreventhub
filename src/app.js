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

// 1. Trust Proxy for Cloud Hosting (Render, Vercel, Railway, Heroku, AWS)
app.set('trust proxy', 1);

// 2. Core Middlewares
app.use(
  cors({
    origin: true, // Allow requesting origin
    credentials: true // Allow cookies across origins
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Serve Static Frontend Web Portal
app.use(express.static(path.join(__dirname, '../public')));

// 4. API Health Check Endpoint (For Cloud Deployment Health Checks)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'Campus Event Management Service is live and healthy',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// 6. Frontend SPA Fallback Route (Non-API requests serve index.html)
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 7. 404 Handler for Unmatched API Endpoints
app.use(notFound);

// 8. Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
