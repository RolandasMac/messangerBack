// models/User.js
const mongoose = require("mongoose");
const { todo } = require("../../../schemas/allSchemas.js");

const todoSchema = new mongoose.Schema(todo, {
  timestamps: true,
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
