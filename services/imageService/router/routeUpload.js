const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { getCloudinaryImage } = require("../controller/imageControlers");

router.post("/upload", upload.single("file"), getCloudinaryImage);

module.exports = router;
