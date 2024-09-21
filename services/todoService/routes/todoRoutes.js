// routes/userRoutes.js
const express = require("express");
const todoController = require("../controllers/todoController");
const { authMiddleware1 } = require("../middleware/authMiddleware1");
const router = express.Router();

router.get("/", authMiddleware1, todoController.getTodos);
router.post("/", authMiddleware1, todoController.createTodo);
router.patch("/", authMiddleware1, todoController.markAsCompleted);
router.delete("/", authMiddleware1, todoController.deleteTodo);

module.exports = router;
