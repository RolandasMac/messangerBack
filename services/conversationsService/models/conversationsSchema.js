const mongoose = require("mongoose");
// const { conversations } = require("../../../schemas/allSchemas");

const conversation = {
  convParticipants: [
    {
      userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
      },
      hasNewMsg: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  ],
  messages: [
    {
      message: {
        type: String,
        required: true,
      },
      ownerId: {
        type: mongoose.Schema.ObjectId,
        required: true,
      },
      createdAt: {
        type: String,
        required: true,
      },
      likes: [],
    },
  ],
};

const conversationsSchema = new mongoose.Schema(conversation, {
  timestamps: true,
});

const Conversations = mongoose.model("Conversations", conversationsSchema);

module.exports = Conversations;
