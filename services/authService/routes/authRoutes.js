// routes/userRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const upload = require("../middleware/multer");
const getCloudinaryurl = require("../middleware/cloudinary");

const router = express.Router();

router.post("/sendemailcode", authController.sendEmailCode);
router.post(
  "/createuser",
  upload.single("file"),
  getCloudinaryurl,
  authController.createUser
);
router.post("/login", authController.login);
router.get("/getallusers", authController.getAllUsers);
router.post("/autologin", authController.autologin);
router.get("/:id", authController.getOneUser);

module.exports = router;
