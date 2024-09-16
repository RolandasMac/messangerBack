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
const conversationsRouter = require("./routes/conversationsRouter");
const path = require("path");
const cors = require("cors");
const cote = require("cote");
const conversationsController = require("./controllers/conversationsController");
const cookieParser = require("cookie-parser");

// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cookieParser());
const PORT = process.env.CONVERSATIONSPORT || 5000;
const PORTSSL = process.env.CONVERSPORTSSL;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";
const HOST = process.env.HOST;

// Middleware to parse JSON
app.use(express.json());

// Use cors
app.use(
  cors({
    origin: `https://${HOST}:3000`,
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
  // console.log(result[0]);
  cb(result[0]);
});

// ******************************************

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(PORT);
httpsServer.listen(PORTSSL);
