const router = require("express").Router();
const ClothingItem = require("./clothingItems");
const userRouter = require("./users");
const {
  login,
  createUser,
  getCurrentUser,
  updateUserProfile,
} = require("../controllers/users");
const auth = require("../middlewares/auth");
const {
  validateAuthentication,
  validateUserInfo,
  validateUpdateUserInfo,
} = require("../middlewares/validation");

router.use("/items", ClothingItem);
router.use("/users", userRouter);

router.post("/signin", validateAuthentication, login);
router.post("/signup", validateUserInfo, createUser);
router.get("/profile", auth, getCurrentUser);
router.patch("/profile", auth, validateUpdateUserInfo, updateUserProfile);

module.exports = router;
