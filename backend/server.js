const app = require('./app');

const PORT = process.env.PORT || 5000;

// Vercel's Express runtime imports this app directly. Local development still
// starts a normal HTTP server when this file is executed with "node server.js".
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`StayFinder API listening on port ${PORT}`);
  });
}

module.exports = app;
