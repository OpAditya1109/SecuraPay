const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const AuthRouter = require("./Routes/AuthRouter");
const WalletRouter = require("./Routes/WalletRouter")

require("dotenv").config();
require("./models/db")
const PORT = process.env.PORT || 8080;

app.get("/ping", (req, res) => {
  res.send("PONG");
});

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", AuthRouter);
app.use("/wallet", WalletRouter)

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
