const errorHandler = (err, req, res, next) => {
  console.error(err);

  console.log("Status Code:", err.statusCode);

  if (err instanceof Error) {
    return res.status(err.statusCode || 500).send({
      message: err.message || "An unexpected error occurred",
    });
  }

  res.status(500).send({ message: "Internal Server Error" });
};

module.exports = errorHandler;
