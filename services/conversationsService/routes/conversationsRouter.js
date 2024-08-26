const express = require("express");
const conversationsController = require("../controllers/conversationsController");

const router = express.Router();

router.get("/test", conversationsController.test);
router.get("/create", conversationsController.testCreate);
// router.post("/", todoController.createTodo);
// router.patch("/", todoController.markAsCompleted);
// router.delete("/", todoController.deleteTodo);

module.exports = router;
