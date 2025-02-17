const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { JWT_SECRET } = require("../utils/config");

const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ServerError,
} = require("../utils/errors");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(new ConflictError("Email is already taken"));
      }

      return new Promise((resolve, reject) => {
        bcrypt.hash(password, 8, (err, hashedPassword) => {
          if (err) {
            return reject(new Error("Error hashing the password"));
          }
          return resolve(hashedPassword);
        });
      })
        .then((hashedPassword) =>
          User.create({
            name,
            avatar,
            email,
            password: hashedPassword,
          })
        )
        .catch((createUserError) => {
          if (createUserError.name === "ValidationError") {
            return next(new BadRequestError("Invalid data provided"));
          }

          if (createUserError.name === "CastError") {
            return next(new BadRequestError("Invalid ID"));
          }

          return next(new ServerError("An error has occurred on the server"));
        });
    })
    .catch(next(new ServerError("Error processing the request")));
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        return next(new NotFoundError("User not found"));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("User not found"));
      }

      return next(new ServerError("An error has occurred on the server"));
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      const userInfo = {
        userEmail: user.email,
        userName: user.name,
        userAvatar: user.avatar,
        userId: user._id,
      };
      return res
        .status(200)
        .send({ message: "Login successful", token, userInfo });
    })
    .catch((error) => {
      if (error.message === "Invalid credentials") {
        return next(new UnauthorizedError("Invalid email or password"));
      }
      return next(new ServerError("An error has occurred on the server"));
    });
};

const updateUserProfile = (req, res, next) => {
  const { name, avatar } = req.body;

  if (!name && !avatar) {
    return next(
      new BadRequestError("At least one field (name or avatar) is required")
    );
  }

  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => {
      if (!user) {
        return next(new NotFoundError("User not found"));
      }
      return res.status(200).send(user);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        return next(new BadRequestError("Invalid data provided"));
      }
      return next(new ServerError("An error has occurred on the server"));
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
