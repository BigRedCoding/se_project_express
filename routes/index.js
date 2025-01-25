const router = require("express").Router();

const clothingItem = require("./clothingItems");

const userRouter = require("./users");

const auth = require("../middlewares/auth");

router.use("/items", clothingItem);

router.use("/users", auth, userRouter);

module.exports = router;
