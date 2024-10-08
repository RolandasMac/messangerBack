// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const todoRouter = require("./routes/todoRoutes");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cookieParser());
const PORT = process.env.TODOPORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";
const HOST = process.env.HOST;

// Middleware to parse JSON
app.use(express.json());

// Use cors
app.use(
  cors({
    origin: `https://${HOST}`,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(`MongoDB connection error: ${err}`));

// Use the user router
app.use("/", todoRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
