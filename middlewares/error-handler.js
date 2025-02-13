// const { ServerError } = require("../utils/errors");

// const errorHandler = (err, req, res, next) => {
//   console.error(err);

//   if (err instanceof ServerError) {
//     return next(new ServerError("Internal Server Error"));
//   }
// };

// module.exports = errorHandler;

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Use the statusCode from the error, default to 500 if not present
  const statusCode = err.statusCode || 500;
  const message = err.message || "An internal server error occurred";

  res.status(statusCode).send({ message });
};

module.exports = errorHandler;
