// server.js
const fs = require("fs");
const http = require("http");
const https = require("https");
const privateKey = fs.readFileSync("../../cert/private.key", "utf8");
const certificate = fs.readFileSync("../../cert/certificate.crt", "utf8");

const credentials = { key: privateKey, cert: certificate };

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoutes");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
//*************************************************** */
// const bodyParser = require("body-parser");
// var multer = require("multer");
// var upload = multer();
//*************************************************** */
// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cookieParser());
const PORT = process.env.AUTHPORT || 5000;
const PORTSSL = process.env.AUTHPORTSSL;
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
    origin: "https://localhost:3000", // Replace with your frontend's origin
    credentials: true, // This allows cookies and other credentials to be sent
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
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(PORT);
httpsServer.listen(PORTSSL);
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
