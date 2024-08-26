const mongoose = require("mongoose");
const { conversations } = require("../../../schemas/allSchemas");

const conversationsSchema = new mongoose.Schema(conversations, {
  timestamps: true,
});

const Conversations = mongoose.model("Conversations", conversationsSchema);

module.exports = Conversations;
