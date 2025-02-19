const cors = require("cors");

const express = require("express");

process.env = require("dotenv").config();

const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;

const app = express();

const { errors } = require("celebrate");

const errorHandler = require("./middlewares/error-handler");

const { requestLogger, errorLogger } = require("./middlewares/logger");

const HttpError = require("./utils/errors");

const mainRouter = require("./routes/index");

const corsOptions = {
  origin(origin, callback) {
    if (
      origin === "https://www.bdwtwr.justlearning.net" ||
      origin === "https://api.bdwtwr.justlearning.net"
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new HttpError.ServerError("An error has occurred on the server");
  }, 0);
});

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db").catch(() => {
  throw new HttpError.ServerError("An error has occurred on the server");
});

app.use(express.json());

app.use("/", mainRouter);

app.use((req, res, next) => next(HttpError.NotFoundError("Page not found")));

app.listen(PORT);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);
