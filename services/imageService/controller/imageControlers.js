const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const getCloudinaryImage = (req, res) => {
  // res.status(200).json(req.file);
  cloudinary.uploader.upload(req.file.path, function (err, result) {
    console.log(req.file.path);

    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error",
      });
    }

    res.status(200).json({
      success: true,
      message: "Uploaded!",
      data: result,
    });
  });
};

module.exports = {
  getCloudinaryImage,
};
