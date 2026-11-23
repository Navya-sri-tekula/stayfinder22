const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

const bucket = process.env.STAYFINDER_STORAGE_BUCKET || 'stayfinder-images';
const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const region = process.env.AWS_REGION || 'ap-southeast-1';
const configured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  endpoint
);

const s3 = configured ? new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}) : null;

const extensionByMime = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const uploadImageBuffer = async (buffer, originalName, mimeType) => {
  if (!configured || !s3) {
    const error = new Error('Image storage is not configured. Set the Neon Object Storage environment variables in Vercel.');
    error.statusCode = 503;
    throw error;
  }
  const extension = extensionByMime[mimeType] || path.extname(originalName || '').toLowerCase() || '.jpg';
  const key = 'properties/' + crypto.randomUUID() + extension;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType || 'application/octet-stream',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return endpoint.replace(/\\/+$/, '') + '/' + encodeURIComponent(bucket) + '/' + encodedKey;
};

module.exports = { uploadImageBuffer };
