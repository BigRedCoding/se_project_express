const express = require("express");

require("dotenv").config();

const mongoose = require("mongoose");

const cors = require("cors");

const { PORT = 3001 } = process.env;
const app = express();
const { NotFoundError } = require("./utils/errors");

const errorHandler = require("./middlewares/error-handler");

const { errors } = require("celebrate");

const { requestLogger, errorLogger } = require("./middlewares/logger");

app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

const mainRouter = require("./routes/index");

app.use(cors());

// app.use(
//   cors({
//     origin: "https://www.bdwtwr.justlearning.net",
//     methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
//   })
// );

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connection to DB Successful!");
  })
  .catch(console.error);

app.use(express.json());

app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);
