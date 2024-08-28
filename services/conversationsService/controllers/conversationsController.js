const Conversations = require("../models/conversationsSchema");
const mongoose = require("mongoose");
// Example usage

// findOrCreateConversation(participants, newMessage)
//   .then((conversation) => console.log("Conversation:", conversation))
//   .catch((error) => console.error(error));

exports.test = async (req, res) => {
  try {
    const conversationWithUsers = await Conversations.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId("66cd5ea8475814b814852dce"),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "convParticipants.userId",
            foreignField: "_id",
            as: "convParticipants1",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "messages.ownerId",
            foreignField: "_id",
            as: "messageOwners",
          },
        },
        {
          $addFields: {
            messages: {
              $map: {
                input: "$messages",
                as: "message",
                in: {
                  message: "$$message.message",
                  ownerId: "$$message.ownerId",
                  createdAt: "$$message.createdAt",
                  owner: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$messageOwners",
                          as: "owner",
                          cond: {
                            $eq: ["$$owner._id", "$$message.ownerId"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    );

    res.status(200).json(conversationWithUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.Create = async (req, res, next) => {
  const { participants, newMessage } = req.body;
  console.log(participants, newMessage);

  // const participants = [
  //   { id: "66c87613e5c09f86733010f4" },
  //   { id: "66c8c9eeb18525d6f123e58e" },
  // ];
  // const newMessage = {
  //   message: "ergergergergergergergergregerg",
  //   ownerId: "66c87613e5c09f86733010f4",
  //   createdAt: "2024-08-26T18:42:52.751Z",
  // };
  // console.log(participants);
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
    // Use findOneAndUpdate to either update or create the conversation
    const updatedConversation = await Conversations.findOneAndUpdate(
      query,
      {
        $push: { messages: newMessage },
        $setOnInsert: { convParticipants: participants },
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if no match is found
      }
    );
    // console.log(updatedConversation);
    // res.status(200).json(updatedConversation);
    req.params.convId = updatedConversation._id;
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getConvById = async (req, res) => {
  try {
    const oneConv = await Conversations.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.convId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "convParticipants.userId",
            foreignField: "_id",
            as: "convParticipants1",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "messages.ownerId",
            foreignField: "_id",
            as: "messageOwners",
          },
        },
        {
          $addFields: {
            messages: {
              $map: {
                input: "$messages",
                as: "message",
                in: {
                  message: "$$message.message",
                  ownerId: "$$message.ownerId",
                  createdAt: "$$message.createdAt",
                  owner: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$messageOwners",
                          as: "owner",
                          cond: {
                            $eq: ["$$owner._id", "$$message.ownerId"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            __v: 0,
            convParticipants: 0,
            messageOwners: 0,
          },
        },
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    );
    res.status(200).json(oneConv[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getConversationsList = async (req, res) => {
  try {
    const conversationsList = await await Conversations.aggregate(
      [
        {
          $lookup: {
            as: "participantsRes",
            from: "users",
            foreignField: "_id",
            localField: "convParticipants.userId",
          },
        },
        {
          $project: {
            _id: 1,
            participantsRes: 1,
            updatedAt: 1,
          },
        },
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    );
    res.status(200).json(conversationsList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.sendMessage = async (req) => {
  const { toConv, userId, message } = req.data;
  // const user = await
  const newMessage = {
    message: message,
    ownerId: userId,
    createdAt: new Date(),
  };
  try {
    const oneConversation = await Conversations.findOneAndUpdate(
      { _id: toConv },
      { $push: { messages: newMessage } },
      { new: true }
    );

    const oneConv = await Conversations.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(oneConversation._id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "convParticipants.userId",
            foreignField: "_id",
            as: "convParticipants1",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "messages.ownerId",
            foreignField: "_id",
            as: "messageOwners",
          },
        },
        {
          $addFields: {
            messages: {
              $map: {
                input: "$messages",
                as: "message",
                in: {
                  message: "$$message.message",
                  ownerId: "$$message.ownerId",
                  createdAt: "$$message.createdAt",
                  owner: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$messageOwners",
                          as: "owner",
                          cond: {
                            $eq: ["$$owner._id", "$$message.ownerId"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            convParticipants1: 1,
            lastMessage: {
              $arrayElemAt: [
                "$messages",
                { $subtract: [{ $size: "$messages" }, 1] },
              ],
            },
          },
        },
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    );

    return oneConv;
  } catch (error) {
    // res.status(400).json({ message: error.message });
    return error;
  }
};

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
