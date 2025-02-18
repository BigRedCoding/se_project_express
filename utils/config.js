require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

console.log("JWT_SECRET:", JWT_SECRET);

//const { SECRET_KEY = "JWT_SECRET" } = process.env;

module.exports = {
  JWT_SECRET,
};
