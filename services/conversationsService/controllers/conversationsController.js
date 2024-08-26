const Conversations = require("../models/conversationsSchema");
const mongoose = require("mongoose");
// Example usage

// findOrCreateConversation(participants, newMessage)
//   .then((conversation) => console.log("Conversation:", conversation))
//   .catch((error) => console.error(error));

exports.test = async (req, res) => {
  try {
    const message = "Conversations servisas veikia???!!!";
    // console.log(userId);

    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.testCreate = async (req, res) => {
  const participants = [
    { userId: "user3", userName: "Gaidys Gaidelis", avatar: "avatar3.png" },
    { userId: "user1", userName: "John Doe", avatar: "avatar1.png" },
    { userId: "user2", userName: "Jane Smith", avatar: "avatar2.png" },
  ];

  const newMessage = {
    message: "Hello, this is a new message!",
    owner: {
      userId: "user1",
      userName: "John Doe",
      avatar: "avatar1.png",
    },
    createdAt: new Date().toISOString(),
  };
  try {
    // Sort participants by userId to ensure consistency
    participants.sort((a, b) => a.userId.localeCompare(b.userId));

    // Create a query to find a conversation with exactly these participants
    const query = {
      convParticipants: {
        $all: participants.map((participant) => ({
          $elemMatch: { userId: participant.userId },
        })),
      },
    };

    // Find and update the conversation if it exists, or create a new one
    const updatedConversation = await Conversations.findOneAndUpdate(
      query,
      {
        $setOnInsert: {
          convId: new mongoose.Types.ObjectId().toString(), // Generate a new convId
          convParticipants: participants,
        },
        $push: {
          messages: newMessage,
        },
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create the document if it doesn't exist
      }
    );

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error finding or creating conversation:", error);
    throw error;
  }
};

// exports.createTodo = async (req, res) => {
//   try {
//     const newTodo = req.body.data;
//     const userId = "66be44fc19199fe7bb2273eb";
//     const result = await Todo.findOneAndUpdate(
//       { _id: userId },
//       {
//         $push: { todos: newTodo },
//       },
//       {
//         new: true,
//         upsert: true,
//       }
//     );
//     res.status(201).json(result.todos);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// exports.markAsCompleted = async (req, res) => {
//   const { taskId, completed } = req.body;
//   const userId = "66be44fc19199fe7bb2273eb";

//   try {
//     const result = await Todo.findOneAndUpdate(
//       { _id: userId, "todos._id": taskId },
//       { $set: { "todos.$.completed": completed } },
//       { new: true }
//     );
//     console.log("Todo item marked as completed:", result);
//     res.status(201).json(result.todos);
//   } catch (error) {
//     console.error("Error marking todo as completed:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// exports.deleteTodo = async (req, res) => {
//   const userId = "66be44fc19199fe7bb2273eb";
//   const { taskId } = req.body;
//   try {
//     const result = await Todo.findOneAndUpdate(
//       { _id: userId },
//       { $pull: { todos: { _id: taskId } } },
//       { new: true }
//     );
//     return res.status(201).json(result.todos);
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
