const mongoose = require("mongoose");

const validator = require("validator");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The name field is required"],
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: [true, "The avatar field is required"],
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid URL",
    },
  },
  email: {
    type: String,
    required: [true, "The email field is required"],
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: [true, "The password field is required"],
    minlength: 6,
    validate: {
      validator(value) {
        return /[!@#$%^&*(),.?":{}|<>]/.test(value);
      },
      message: "Password must contain at least one symbol",
    },
    select: false,
  },
});

userSchema.pre("save", async function hashPassword(next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.statics.findUserByCredentials = function checkEmailPassword(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Invalid credentials"));
      }

      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return Promise.reject(new Error("Invalid credentials"));
        }
        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
