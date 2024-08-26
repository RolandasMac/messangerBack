const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const uploadRoute = require("./router/routeUpload");

const cloudinary = require("./utils/cloudinary");
// const upload = require("./middleware/multer");
const cote = require("cote");
const imageService = new cote.Responder({
  name: "Image Service responder",
});

imageService.on("image", (req, cb) => {
  // console.log(req.val);
  cloudinary.uploader.upload(req.val, function (err, result) {
    cb(result);
  });
});

const app = express();
const PORT = process.env.IMAGEPORT || 5000;
app.use(express.json({ extended: true }));
app.use(
  "/services/imageService/uploadedfiles",
  express.static(path.join(__dirname, "uploadedfiles"))
);

//the route
app.use("/", uploadRoute);

//posrt connection
app.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`);
});

//cloudinary account:  https://cloudinary.com/signup
