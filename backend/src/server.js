// Load configuration from JSON files
const config = require('./config');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const formRoutes = require('./routes/forms');
const formSharesRoutes = require('./routes/formShares');
const formFilesRoutes = require('./routes/formfiles');
const releasedFormRoutes = require('./routes/releasedForms');
const travelerRoutes = require('./routes/travelers');
const travelerDataRoutes = require('./routes/travelerData');
const travelerSharesRoutes = require('./routes/travelerShares');
const discrepancyLogRoutes = require('./routes/discrepancyLogs');
const travelerNoteRoutes = require('./routes/travelerNotes');
const binderRoutes = require('./routes/binders');
const formReviewsRoutes = require('./routes/formReviews');
const systemRoutes = require('./routes/system');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const serverConfig = config.server;
app.use(cors(serverConfig.cors));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
const rateLimitConfig = serverConfig.rateLimit;
const limiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/forms', formSharesRoutes);
app.use('/api/formfiles', formFilesRoutes);
app.use('/api/reviews/forms', formReviewsRoutes);
app.use('/api/released-forms', releasedFormRoutes);
app.use('/api/travelers', travelerRoutes);
app.use('/api/travelers', travelerDataRoutes);
app.use('/api/travelers', travelerSharesRoutes);
app.use('/api/travelers', discrepancyLogRoutes);
app.use('/api/travelers', travelerNoteRoutes);
app.use('/api/binders', binderRoutes);
app.use('/api/system-info', systemRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const dbConfig = config.database;
    const conn = await mongoose.connect(dbConfig.uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Validate authentication configuration on startup
const validateAuthConfigOnStartup = () => {
  try {
    const { validateAuthConfig } = require('./controllers/auth');
    validateAuthConfig(config.auth);
    logger.info('Authentication configuration validated successfully');
  } catch (error) {
    logger.error('Authentication configuration error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = serverConfig.port;

connectDB().then(() => {
  validateAuthConfigOnStartup();
  app.listen(PORT, () => {
    logger.info(`Server running in ${serverConfig.env} mode on port ${PORT}`);
  });
});

module.exports = app;