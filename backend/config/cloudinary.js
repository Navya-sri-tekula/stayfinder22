const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a local file or buffer to Cloudinary or falls back to local static URL.
 * @param {string} localFilePath - Path to file stored locally by multer
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} - Resolves to public URL
 */
const uploadImageFile = async (localFilePath, originalName) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'stayfinder',
      });
      // Optionally delete temp file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback to local file path
    }
  }

  // Local fallback: return relative URL served by express.static
  const filename = path.basename(localFilePath);
  return `/uploads/${filename}`;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadImageFile,
};
