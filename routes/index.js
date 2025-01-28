const router = require("express").Router();

const clothingItem = require("./clothingItems");

const userRouter = require("./users");

const { login, createUser } = require("../controllers/users");

router.use("/items", clothingItem);

router.use("/users", userRouter);

router.post("/signin", login);
router.post("/signup", createUser);

module.exports = router;
