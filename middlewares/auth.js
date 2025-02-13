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
    if (!token || !JWT_SECRET) {
      return next(new UnauthorizedError("Token or JWT Secret is missing"));
    }

    const payload = jwt.verify(token || "", JWT_SECRET || "");

    req.user = payload;

    return next();
  } catch (err) {
    return next(new UnauthorizedError("Invalid email or password"));
  }
};

module.exports = auth;
