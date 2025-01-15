const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AuthRouter = require("./routes/AuthRouter");
const ProductRouter = require("./routes/ProductRouter");
require("dotenv").config();
require("./models/db");

const app = express();
const PORT = process.env.PORT || 8080;

// Import the cron job for user cleanup
require("./corn_job/UserCleanup"); // Adjust the path based on your file structure

// Middleware for parsing JSON and enabling CORS
app.use(bodyParser.json());

// Configure CORS to allow requests from your frontend
const allowedOrigins = [process.env.FRONTEND_URL]; // Use FRONTEND_URL from .env
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies and headers
  })
);

// Health check route
app.get("/ping", (req, res) => {
  res.send("PONG");
});

// Routes
app.use("/auth", AuthRouter);
app.use("/products", ProductRouter);

// Start the server, listening on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
