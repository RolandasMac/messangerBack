// Importing express module
const express = require("express");
const dotenv = require("dotenv");
const contactsRouter = require("./routes/contactsRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Load environment variables from a .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Setting the port
const PORT = process.env.CONTACTSPORT;
const HOST = process.env.HOST;

// Initializing the app
const app = express();
app.use(cookieParser());

// Middleware to parse JSON
app.use(express.json());

// Use cors
app.use(
  cors({
    origin: `https://${HOST}`, // Replace with your frontend's origin
    credentials: true, // This allows cookies and other credentials to be sent
  })
);

// A basic route
// app.get("/contacts", (req, res) => {
//   res.send("Hello, World! This is your contacts server...");
// });
app.use("/", contactsRouter);

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
