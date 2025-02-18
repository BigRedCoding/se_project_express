process.env = require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

//const { SECRET_KEY = "JWT_SECRET" } = process.env;

module.exports = {
  JWT_SECRET,
};
