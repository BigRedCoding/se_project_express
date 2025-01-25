const router = require("express").Router();

const clothingItem = require("./clothingItems");

const userRouter = require("./users");

const auth = require("../middlewares/auth");

const { login, createUser } = require("../controllers/users");

router.use("/items", clothingItem);

router.use("/users", auth, userRouter);

router.post("/signin", login);
router.post("/signup", createUser);

module.exports = router;
