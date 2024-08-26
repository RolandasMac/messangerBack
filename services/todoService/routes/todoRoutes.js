// routes/userRoutes.js
const express = require("express");
const todoController = require("../controllers/todoController");

const router = express.Router();

router.get("/", todoController.getTodos);
router.post("/", todoController.createTodo);
router.patch("/", todoController.markAsCompleted);
router.delete("/", todoController.deleteTodo);

module.exports = router;
