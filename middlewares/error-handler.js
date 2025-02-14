const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "An internal server error occurred";

  res.status(statusCode).send({ message });
};

module.exports = errorHandler;
