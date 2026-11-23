const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSequelize } = require('./config/db');
const { initModels } = require('./models');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const foodRoutes = require('./routes/foodRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { getRoomsByPropertyId } = require('./controllers/roomController');
const { getFoodByPropertyId } = require('./controllers/foodController');
const { getPropertyReviews } = require('./controllers/reviewController');
const app = express();
let databaseInitialization;
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0) return callback(null, true);
    const allowed = allowedOrigins.includes(origin) ||
      (origin.startsWith('https://stayfinder22-frontend') && origin.endsWith('.vercel.app')) ||
      origin === 'http://localhost:3000';
    return callback(allowed ? null : new Error('Origin is not allowed by StayFinder CORS.'), allowed);
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(async (req, res, next) => {
  try {
    if (!databaseInitialization) {
      databaseInitialization = (async () => {
        const sequelize = await initSequelize();
        initModels(sequelize);
        await sequelize.sync();
      })().catch((error) => {
        databaseInitialization = null;
        throw error;
      });
    }
    await databaseInitialization;
    next();
  } catch (error) {
    next(error);
  }
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StayFinder API is running.', database: 'connected', timestamp: new Date().toISOString() });
});
app.get('/api/properties/:propertyId/rooms', getRoomsByPropertyId);
app.get('/api/properties/:propertyId/food', getFoodByPropertyId);
app.get('/api/properties/:propertyId/reviews', getPropertyReviews);
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
module.exports = app;
