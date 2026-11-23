const multer = require('multer');
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, JPG, PNG, WEBP, and GIF images are allowed.'));
};
// In-memory uploads avoid writing into Vercel's read-only deployment filesystem.
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
