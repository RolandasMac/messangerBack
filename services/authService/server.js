// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoutes");
const path = require("path");
const cors = require("cors");
//*************************************************** */
// const bodyParser = require("body-parser");
// var multer = require("multer");
// var upload = multer();
//*************************************************** */
// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.AUTHPORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";

// Middleware to parse JSON
app.use(express.json());
//************************************************ */
// // for parsing application/json
// app.use(bodyParser.json());

// // for parsing application/xwww-
// app.use(bodyParser.urlencoded({ extended: true }));
// //form-urlencoded

// // for parsing multipart/form-data
// app.use(upload.array());
// app.use(express.static("image"));
//************************************************ */
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
app.use("/", authRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// cote service *****
const User = require("./models/userSchema");
const cote = require("cote");
const authService = new cote.Responder({
  name: "User Service responder",
  key: "User_Service_key",
});

authService.on("auth", async (req, cb) => {
  console.log(req.data);
  let id = req.data.id;
  const result = await User.findOneAndUpdate(
    { _id: id },
    { isOnline: true, socketId: req.data.socketId, lastloggedAt: new Date() },
    { new: true }
  );
  console.log("Gaidys");
  console.log(result);
  cb(result);
});
authService.on("disconect", async (req, cb) => {
  console.log(req.data.socketId);
  // let id = req.data.id;
  const result = await User.findOneAndUpdate(
    { socketId: req.data.socketId },
    { isOnline: false, socketId: "", lastloggedAt: new Date() },
    { new: true }
  );
  // console.log("Gaidys");
  // console.log(result);
  cb(result);
});

// ****************************************
