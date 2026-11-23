const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error('JWT_SECRET must be configured with at least 32 characters.');
    error.statusCode = 500;
    throw error;
  }
  return secret;
};
module.exports = { getJwtSecret };
