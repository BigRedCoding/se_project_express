const router = require("express").Router();

const clothingItem = require("./clothingItems");

const userRouter = require("./users");

router.use("/users", userRouter);
router.use("/items", clothingItem);

module.exports = router;
