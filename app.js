const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { PORT = 3001 } = process.env;
const mainRouter = require("./routes/index");
const routes = require("./routes"); //May need to put into mongoose

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connection to DB Successful!");
  })
  .catch(console.error);

app.use(express.json());
app.use("/", mainRouter);
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((req, res) => {
  res.status(404).send({ message: "Requested resource not found" });
});
