// routes/userRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const upload = require("../middleware/multer");
const getCloudinaryurl = require("../middleware/cloudinary");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/sendemailcode", authController.sendEmailCode);
router.post(
  "/createuser",
  upload.single("file"),
  getCloudinaryurl,
  authController.createUser
);
router.post("/login", authController.login);
router.get("/getallusers", authMiddleware, authController.getAllUsers);
router.post("/autologin", authController.autologin);
router.get("/logout", authMiddleware, authController.logout);

// router.get("/labas", authController.test);
// router.get("/labas1", authMiddleware, authController.testgauti);

router.get("/:id", authMiddleware, authController.getOneUser);

module.exports = router;
