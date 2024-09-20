// controllers/userController.js
const Todo = require("../models/todoSchema");

exports.getTodos = async (req, res) => {
  try {
    // console.log(req.tokenInfo);
    // const userId = req.tokenInfo.id;
    const userId = "66d43ed067293d5823682e99";
    // console.log(userId);
    const result = await Todo.findById(userId);
    if (result) {
      res.status(201).json(result.todos);
    } else {
      res.status(201).json([]);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const newTodo = req.body.data;
    const userId = req.tokenInfo.id;
    const result = await Todo.findOneAndUpdate(
      { _id: userId },
      {
        $push: { todos: newTodo },
      },
      {
        new: true,
        upsert: true,
      }
    );
    res.status(201).json(result.todos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markAsCompleted = async (req, res) => {
  const { taskId, completed } = req.body;
  const userId = req.tokenInfo.id;

  try {
    const result = await Todo.findOneAndUpdate(
      { _id: userId, "todos._id": taskId },
      { $set: { "todos.$.completed": completed } },
      { new: true }
    );
    console.log("Todo item marked as completed:", result);
    res.status(201).json(result.todos);
  } catch (error) {
    console.error("Error marking todo as completed:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  const userId = req.tokenInfo.id;
  const { taskId } = req.body;
  try {
    const result = await Todo.findOneAndUpdate(
      { _id: userId },
      { $pull: { todos: { _id: taskId } } },
      { new: true }
    );
    return res.status(201).json(result.todos);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
