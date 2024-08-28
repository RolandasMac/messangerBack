const express = require("express");
const conversationsController = require("../controllers/conversationsController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", conversationsController.test);
router.post(
  "/create",
  conversationsController.Create,
  conversationsController.getConvById
);
router.get(
  "/getconversationslist",
  authMiddleware,
  conversationsController.getConversationsList
);
router.get("/getconversationbyid/:convId", conversationsController.getConvById);
router.get("/testkitas", authMiddleware, conversationsController.testaskitas);

module.exports = router;
