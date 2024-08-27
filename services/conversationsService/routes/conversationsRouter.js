const express = require("express");
const conversationsController = require("../controllers/conversationsController");

const router = express.Router();

router.get("/test", conversationsController.test);
router.post(
  "/create",
  conversationsController.Create,
  conversationsController.getConvById
);
router.get(
  "/getconversationslist",
  conversationsController.getConversationsList
);
router.get("/getconversationbyid/:convId", conversationsController.getConvById);
// router.delete("/", todoController.deleteTodo);

module.exports = router;
