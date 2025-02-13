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

  if (!JWT_SECRET) {
    return res.status(500).json({ error: "JWT SECRET IS MISSING" });
  }

  try {
    // if (!token) {
    //   return res.status(401).json({ error: "Token is missing" });
    //   // return next(new UnauthorizedError("Token is missing"));
    // }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "JsonWebTokenError") {
          return res.status(401).json({ error: "Invalid token" });
        } else if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token has expired" });
        } else if (err.name === "NotBeforeError") {
          return res.status(401).json({ error: "Token is not active yet" });
        } else {
          return res
            .status(500)
            .json({ error: "An error occurred while verifying the token" });
        }
      }
      if (
        !decoded.permissions ||
        !decoded.permissions.includes("requiredPermission")
      ) {
        return res.status(403).json({
          error: "You do not have permission to access this resource",
        });
      }

      req.user = decoded;
      return next();
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid or malformed token"));
    }
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token has expired"));
    }

    return next(new UnauthorizedError("Failed to authenticate token"));
  }
};

module.exports = auth;
