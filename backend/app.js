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
const geocodeCache = new Map();
let geocodeQueue = Promise.resolve();
let lastGeocodeAt = 0;
const searchOpenStreetMapLocation = async (query) => {
  const key = query.trim().toLowerCase();
  const cached = geocodeCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  const task = geocodeQueue.then(async () => {
    const freshCache = geocodeCache.get(key);
    if (freshCache && freshCache.expiresAt > Date.now()) return freshCache.result;
    const wait = Math.max(0, 1100 - (Date.now() - lastGeocodeAt));
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    lastGeocodeAt = Date.now();
    const normalizedQuery = query.trim();
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&dedupe=1&countrycodes=in&limit=5&q=${encodeURIComponent(normalizedQuery)}`;
    const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'StayFinder/1.0 (location search)' } });
    if (!response.ok) throw new Error('OpenStreetMap location search is temporarily unavailable.');
    const results = await response.json();
    const normalized = key.replace(/[^a-z0-9 ]/g, ' ').split(/\\s+/).filter(Boolean);
    const ranked = results.map((item) => {
      const address = item.address || {};
      const searchable = [item.display_name, address.suburb, address.neighbourhood, address.city_district, address.city, address.town, address.village, address.county, address.state].filter(Boolean).join(' ').toLowerCase();
      const matched = normalized.filter((token) => searchable.includes(token)).length;
      const india = String(address.country_code || '').toLowerCase() === 'in' ? 2 : 0;
      const locality = /suburb|neighbourhood|residential|quarter|village|town|city/i.test(String(item.type || '') + ' ' + String(item.class || '')) ? 1 : 0;
      return { item, score: matched * 10 + india + locality };
    }).sort((a, b) => b.score - a.score);
    const best = ranked[0]?.item;
    const result = best ? { latitude: Number(best.lat), longitude: Number(best.lon), display_name: best.display_name, address: best.address || {} } : null;
    geocodeCache.set(key, { result, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    return result;
  });
  geocodeQueue = task.catch(() => {});
  return task;
};
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
app.get('/api/location/search', async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (query.length < 3 || query.length > 160) return res.status(400).json({ success: false, message: 'Enter a location with 3 to 160 characters.' });
    const result = await searchOpenStreetMapLocation(query);
    if (!result) return res.status(404).json({ success: false, message: 'No matching location found. Try a nearby area or landmark.' });
    res.json({ success: true, data: result, provider: 'OpenStreetMap Nominatim' });
  } catch (error) { next(error); }
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
