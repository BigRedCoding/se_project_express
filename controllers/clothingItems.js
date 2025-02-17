const ClothingItem = require("../models/clothingItem");

const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServerError,
} = require("../utils/errors");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
    likes: [],
  })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError());
      }
      return next(new ServerError());
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find()
    .then((items) => {
      res.status(200).send(items);
    })
    .catch(next(new ServerError()));
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id.toString()) {
        return next(
          new ForbiddenError("You are not authorized to delete this item")
        );
      }
      return item.deleteOne().then(() => {
        res.status(200).send({ message: "Item deleted successfully" });
      });
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid ID"));
      }
      return next(new ServerError("An error has occurred on the server"));
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.status(200).send({ data: item });
    })
    .catch((err) => {
      if (err.message === "DocumentNotFoundError") {
        return next(new NotFoundError());
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      return next(new ServerError("An error has occurred on the server"));
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.status(200).send(item);
    })
    .catch((err) => {
      if (err.message === "DocumentNotFoundError") {
        return next(new NotFoundError());
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      return next(new ServerError("An error has occurred on the server"));
    });
};
module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
