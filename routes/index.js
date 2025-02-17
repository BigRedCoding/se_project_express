const router = require("express").Router();
const ClothingItem = require("./clothingItems");
const userRouter = require("./users");
const { login, createUser } = require("../controllers/users");

const {
  validateAuthentication,
  validateUserInfo,
} = require("../middlewares/validation");

router.use("/items", ClothingItem);
router.use("/users", userRouter);

router.post("/signin", validateAuthentication, login);
router.post("/signup", validateUserInfo, createUser);

module.exports = router;
