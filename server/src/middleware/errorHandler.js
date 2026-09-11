export function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(400).json({ error: error.message || 'Unexpected error.' });
}
