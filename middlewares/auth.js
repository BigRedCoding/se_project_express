const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config");

const { UnauthorizedError } = require("../utils/errors");

const auth = (req, res, next) => {
  const { authorization } = req.headers || "";

  console.log("Auth", req.headers);

  if (!authorization) {
    return next(new UnauthorizedError("Authorization header is required"));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    if (!token) {
      return next(new UnauthorizedError("Token is missing"));
    }

    if (!JWT_SECRET) {
      return next(new UnauthorizedError("JWT Secret is missing"));
    }

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;

    return next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError("Invalid or malformed token"));
    }
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError("Token has expired"));
    }

    return next(new UnauthorizedError("Failed to authenticate token"));
  }
};

module.exports = auth;
