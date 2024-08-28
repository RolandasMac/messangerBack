// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const conversationsRouter = require("./routes/conversationsRouter");
const path = require("path");
const cors = require("cors");
const cote = require("cote");
const conversationsController = require("./controllers/conversationsController");

// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.CONVERSATIONSPORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";

// Middleware to parse JSON
app.use(express.json());

// Use cors
app.use(
  cors({
    origin: "*",
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
app.use("/", conversationsRouter);

// Cote service**************************

const convService = new cote.Responder({
  name: "Conv Service responder",
  key: "Conv_Service_key",
});

convService.on("chatMsg", async (req, cb) => {
  // console.log(req.data);
  const result = await conversationsController.sendMessage(req);
  // console.log(result);
  cb(result[0]);
});

// ******************************************

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
