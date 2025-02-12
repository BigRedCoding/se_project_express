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

  let avatarUrl = avatar || "";

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(new ConflictError("Email is already taken"));
      }

      return new Promise((resolve, reject) => {
        bcrypt.hash(password, 8, (err, hashedPassword) => {
          if (err) {
            reject(new Error("Error hashing the password"));
          } else {
            resolve(hashedPassword);
          }
        });
      })
        .then((hashedPassword) => {
          return User.create({
            name,
            avatar: avatarUrl,
            email,
            password: hashedPassword,
          });
        })
        .then((user) => {
          const { password: _, ...userWithoutPassword } = user.toObject();
          res.status(201).send(userWithoutPassword);
        })
        .catch((createUserError) => {
          console.error(createUserError);

          if (createUserError.name === "ValidationError") {
            return next(new BadRequestError("Invalid data provided"));
          }

          if (createUserError.name === "CastError") {
            return next(new BadRequestError("Invalid ID"));
          }

          return next(new ServerError("An error has occurred on the server"));
        });
    })
    .catch((error) => {
      console.error(error);
      return next(new ServerError("Error processing the request"));
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        next(new NotFoundError("User not found"));
      }
      return res.send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      }
      if (error.name === "CastError") {
        next(new BadRequestError("User not found"));
      }

      next(new ServerError("An error has occurred on the server"));
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  User.findUserByCredentials(email, password)
    .then((user) => {
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
          return next(new UnauthorizedError("Invalid email or password"));
        }

        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        const userInfo = {
          userEmail: user.email,
          userName: user.name,
          userAvatar: user.avatar,
          userId: user._id,
        };
        res.status(200).send({ message: "Login successful", token, userInfo });
      });
    })
    .catch((error) => {
      console.error(error);
      if (
        error.name === "DocumentNotFoundError" ||
        error.message === "Invalid credentials"
      ) {
        return next(new UnauthorizedError("Invalid email or password"));
      }
      next(new ServerError("An error has occurred on the server"));
    });
};

const updateUserProfile = (req, res, next) => {
  const { name, avatar } = req.body;

  if (!name && !avatar) {
    return next(
      new BadRequestError("At least one field (name or avatar) is required")
    );
  }

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => {
      if (!user) {
        d;
        return next(new NotFoundError("User not found"));
      }
      res.status(200).send(user);
    })
    .catch((error) => {
      console.error(error);
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
