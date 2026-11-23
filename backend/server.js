const app = require('./app');
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log('StayFinder API listening on port ' + PORT));
}
module.exports = app;
