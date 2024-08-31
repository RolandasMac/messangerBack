const express = require("express");
const conversationsController = require("../controllers/conversationsController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", conversationsController.test);
router.post(
  "/create",
  authMiddleware,
  conversationsController.Create,
  conversationsController.getConvById,
  conversationsController.notifyClientBySocket
);
router.get(
  "/getconversationslist",
  authMiddleware,
  conversationsController.getConversationsList
);
router.post(
  "/getconversationbyid/:convId",
  authMiddleware,
  conversationsController.getConvById,
  conversationsController.sendDataById
);
router.post(
  "/addnewparticipant/:convId",
  authMiddleware,
  conversationsController.addnewparticipant
);
// router.get(
//   "/deleteconversationbyid/:convId",
//   authMiddleware,
//   conversationsController.deleteConvById
// );
router.get("/testkitas", authMiddleware, conversationsController.testaskitas);

module.exports = router;
