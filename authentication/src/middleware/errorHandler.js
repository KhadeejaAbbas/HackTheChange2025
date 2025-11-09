function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const statusCode = err.statusCode || 500;
  const payload = { error: err.message || 'Internal server error' };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
