const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const foodRoutes = require('./routes/foodRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Controller methods for direct nested route aliases
const { getRoomsByPropertyId } = require('./controllers/roomController');
const { getFoodByPropertyId } = require('./controllers/foodController');
const { getPropertyReviews } = require('./controllers/reviewController');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'StayFinder API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// Prompt-specified nested route aliases for direct convenience
app.get('/api/properties/:propertyId/rooms', getRoomsByPropertyId);
app.get('/api/properties/:propertyId/food', getFoodByPropertyId);
app.get('/api/properties/:propertyId/reviews', getPropertyReviews);

// Mount main API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
