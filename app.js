const cors = require("cors");

const express = require("express");

process.env = require("dotenv").config();

const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;

const app = express();

const { errors } = require("celebrate");

const errorHandler = require("./middlewares/error-handler");

const { requestLogger, errorLogger } = require("./middlewares/logger");

const { ServerError } = require("./utils/errors");

const mainRouter = require("./routes/index");

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://api.bdwtwr.justlearning.net"
      : "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTION"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new ServerError();
  }, 0);
});

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db").catch(() => {
  throw new ServerError();
});

app.use(express.json());

app.use("/", mainRouter);

app.listen(PORT);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);
