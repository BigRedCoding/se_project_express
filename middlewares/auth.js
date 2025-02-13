const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config");

const { UnauthorizedError, ServerError } = require("../utils/errors");

const auth = (req, res, next) => {
  const { authorization } = req.headers || "";

  console.log("Auth", req.headers);

  if (!authorization) {
    return next(new UnauthorizedError("Authorization header is required"));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    if (!token) {
      return res.status(401).json({ error: "Token is missing" });
      // return next(new UnauthorizedError("Token is missing"));
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ error: "JWT SECRET IS MISSING" });
      // return next(new ServerError("JWT Secret is missing"));
    }

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;

    return next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid or malformed token"));
    }
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token has expired"));
    }

    if (err.name === "ServerError") {
      return next(
        new ServerError("An unexpected error occurred on the server")
      );
    }

    return next(new ServerError("An unknown error occurred"));
  }
};

module.exports = auth;
