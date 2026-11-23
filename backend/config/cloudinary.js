const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

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

const uploadImageBuffer = async (buffer, originalName) => {
  if (!isCloudinaryConfigured) {
    const error = new Error('Image uploads are not configured. Add the Cloudinary credentials to the backend Vercel project.');
    error.statusCode = 503;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'stayfinder', resource_type: 'image', filename_override: originalName },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { cloudinary, isCloudinaryConfigured, uploadImageBuffer };
