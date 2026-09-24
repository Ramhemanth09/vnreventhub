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

// 1. Trust Proxy for Cloud Hosting (Vercel, Render, Railway, Heroku)
app.set('trust proxy', 1);

// 2. Core Middlewares
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Static Files Serving (Serves public/ folder for UI assets)
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// 4. API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'Campus Event Management Service is live and healthy',
    timestamp: new Date().toISOString()
  });
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// 6. Serve Frontend Landing Page (Root & SPA Fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 7. 404 Handler for Unmatched API Endpoints
app.use(notFound);

// 8. Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
