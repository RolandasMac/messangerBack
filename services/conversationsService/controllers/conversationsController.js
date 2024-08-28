const Conversations = require("../models/conversationsSchema");
const mongoose = require("mongoose");

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
  const { id } = req.tokenInfo;

  const userId = "66cdb7e7aff7b6e274913c98";
  // return res.status(200).json("Gaidys");
  try {
    const conversationsList = await Conversations.aggregate(
      [
        {
          $match: {
            "convParticipants.userId": new mongoose.Types.ObjectId(id),
          },
        },
        // {
        //   $lookup: {
        //     as: "participantsRes",
        //     from: "users",
        //     foreignField: "_id",
        //     localField: "convParticipants.userId",
        //   },
        // },
        // {
        //   $project: {
        //     _id: 1,
        //     participantsRes: 1,
        //     updatedAt: 1,
        //   },
        // },

        { $unwind: "$convParticipants" },
        {
          $lookup: {
            from: "users",
            localField: "convParticipants.userId",
            foreignField: "_id",
            as: "userData",
          },
        },
        { $unwind: "$userData" },
        {
          $addFields: {
            "convParticipants.userInfo": "$userData",
          },
        },
        {
          $group: {
            _id: "$_id",
            convParticipants: {
              $push: "$convParticipants",
            },
            messages: { $first: "$messages" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "messages.ownerId",
            foreignField: "_id",
            as: "messageOwnerData",
          },
        },
        { $unwind: "$messages" },
        {
          $addFields: {
            "messages.ownerInfo": {
              $arrayElemAt: [
                "$messageOwnerData",
                {
                  $indexOfArray: ["$messageOwnerData._id", "$messages.ownerId"],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            convParticipants: {
              $first: "$convParticipants",
            },
            messages: { $push: "$messages" },
          },
        },
      ],
      {
        maxTimeMS: 60000,
        allowDiskUse: true,
        collation: "",
      }
    );
    res.status(200).json(conversationsList);
  } catch (error) {
    console.error(
      "Kažkokia serverio klaida bandant gauti pokalbių sarašą",
      error
    );
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
      {
        $push: { messages: newMessage },
        $inc: { "convParticipants.$[].hasNewMsg": 1 },
      },
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

exports.testaskitas = async (req, res) => {
  const { id } = req.tokenInfo;

  const userId = "66cdb7e7aff7b6e274913c98";
  // return res.status(200).json("Gaidys");
  try {
    const conversationsList = await Conversations.aggregate(
      [
        {
          $match: {
            "convParticipants.userId": new mongoose.Types.ObjectId(id),
          },
        },
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
      {
        maxTimeMS: 60000,
        allowDiskUse: true,
        collation: "",
      }
    );

    res.status(201).json({ message: "Nu gaidys", conversationsList });
  } catch (error) {
    console.error(
      "Kažkokia serverio klaida bandant gauti pokalbių sarašą",
      error
    );
    res.status(400).json({ message: error.message });
  }
};
