// routes/userRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const upload = require("../middleware/multer");
const getCloudinaryurl = require("../middleware/cloudinary");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { authMiddleware1 } = require("../middleware/authMiddleware1");
const {
  passwordValidateMiddleware,
} = require("../middleware/passwordValidateMiddleware");
const {
  emailValidateMiddleware,
} = require("../middleware/emailValidateMiddleware");

router.post("/sendemailcode", authController.sendEmailCode);
router.post(
  "/createuser",
  upload.single("file"),
  getCloudinaryurl,
  authController.createUser
);
router.post("/login", authController.login);
router.get("/getallusers", authMiddleware1, authController.getAllUsers);
router.get("/autologin", authMiddleware1, authController.autologin);
router.get("/logout", authMiddleware1, authController.logout);
router.post(
  "/changeavatar",

  upload.single("file"),
  getCloudinaryurl,
  authMiddleware,
  authController.changeAvatar
);
router.post(
  "/changeuserpassword",
  authMiddleware1,
  passwordValidateMiddleware,
  authController.changePassword
);
router.post(
  "/changeuseremail",
  authMiddleware1,
  emailValidateMiddleware,
  authController.changeEmail
);
router.get("/test", authController.testas);

router.post("/sendemailmessage", authController.sendEmailMessage);

router.get("/:id", authMiddleware1, authController.getOneUser);

module.exports = router;
