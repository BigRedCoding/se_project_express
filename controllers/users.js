const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { JWT_SECRET } = require("../utils/config");

const {
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  CONFLICT_ERROR,
  SERVER_ERROR,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((error) => {
      console.error(error);
      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required" });
  }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(CONFLICT_ERROR)
          .send({ message: "Email is already taken" });
      }
      bcrypt.hash(password, 8, (hashError, hashedPassword) => {
        if (hashError) {
          console.error(hashError);
          return res
            .status(SERVER_ERROR)
            .send({ message: "Error hashing the password" });
        }
        return User.create({ name, avatar, email, password: hashedPassword })
          .then((user) => {
            const { password: _, ...userWithoutPassword } = user.toObject();
            return res.status(201).send(userWithoutPassword);
          })
          .catch((createUserError) => {
            console.error(createUserError);

            if (createUserError.name === "ValidationError") {
              return res
                .status(BAD_REQUEST)
                .send({ message: "Invalid data provided" });
            }

            if (createUserError.name === "CastError") {
              return res.status(BAD_REQUEST).send({ message: "Invalid ID" });
            }

            return res
              .status(SERVER_ERROR)
              .send({ message: "An error has occurred on the server" });
          });
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(SERVER_ERROR).send({ message: "Server error" });
    });
  return null;
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res.send(user);
    })
    .catch((error) => {
      console.error(error);
      if (error.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      if (error.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid ID" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required" });
  }

  return User.findUserByCredentials(email, password)
    .then(console.log(res))
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      console.log(token);

      return res.status(200).send({ message: "Login successful", token });
    })
    .catch((error) => {
      console.error(error);
      return res
        .status(UNAUTHORIZED)
        .send({ message: "Invalid email or password" });
    });
};

const updateUserProfile = (req, res) => {
  const { name, avatar } = req.body;

  if (!name && !avatar) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "At least one field (name or avatar) is required" });
  }

  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res.status(200).send(user);
    })
    .catch((error) => {
      console.error(error);
      if (error.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data provided" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
