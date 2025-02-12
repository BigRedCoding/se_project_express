const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config");

const { UnauthorizedError } = require("../utils/errors");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (
    !authorization ||
    err.name === "DocumentNotFoundError" ||
    err.name === "ValidationError"
  ) {
    return next(new UnauthorizedError("Invalid email or password"));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError("Invalid email or password"));
  }
};

module.exports = auth;
