const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
  login,
  createUser,
  getCurrentUser,
  updateUserProfile,
} = require("../controllers/users");

router.post("/signin", login);
router.post("/signup", createUser);

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateUserProfile);

module.exports = router;
