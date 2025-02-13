const { ServerError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ServerError) {
    return next(new ServerError("Internal Server Error"));
  }

  return next(err);
};

module.exports = errorHandler;
