const Conversations = require("../models/conversationsSchema");
const mongoose = require("mongoose");

//Cote service********
const {
  sendCoteMessageNotifyClient,
  sendCoteMessageNotifyClientRenevdata,
  sendCoteMessageNotifyClientRenevdataOneConv,
} = require("../plugin");
// const { log } = require("console");
//*********************************

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
  const { participants, newMessage, newConvCreate } = req.body;
  // console.log(newConvCreate.createNew);
  try {
    // Sort participants by userId to ensure consistency
    participants.sort((a, b) => a.userId.localeCompare(b.userId));
    // Create a query to find a conversation with exactly these participants
    // ************************************
    const query = {
      convParticipants: {
        $all: participants.map((participant) => ({
          $elemMatch: { userId: participant.userId },
        })),
        $size: participants.length,
      },
    };

    // Step 1: Find or create the conversation
    let conversation = await Conversations.findOne(query);
    // ************************************************************************

    // const conversation = await Conversations.findOne({
    //   $and: [
    //     { "convParticipants.userId": { $all: participants } }, // Matches all participant IDs
    //     { convParticipants: { $size: participants.length } }, // Ensures the length matches
    //   ],
    // });
    // console.log(conversation);

    if (!conversation || newConvCreate.createNew) {
      // Create a new conversation if not found
      conversation = new Conversations({
        convParticipants: participants,
        messages: [newMessage],
      });
    } else {
      // Step 2: Add the new message to the existing conversation
      conversation.messages.push(newMessage);
    }

    // Step 3: Increment hasNewMsg for all participants except the message sender
    conversation.convParticipants.forEach((participant) => {
      if (participant.userId !== newMessage.ownerId) {
        participant.hasNewMsg += 1;
      }
    });

    // Save the updated conversation
    const updatedConversation = await conversation.save();

    // console.log("Updated or Created Conversation:", updatedConversation);

    // console.log(updatedConversation);
    // res.status(200).json(updatedConversation);

    req.params.convId = updatedConversation._id;

    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getConvById = async (req, res, next) => {
  const { id } = req.tokenInfo;
  const { oldId } = req.body;
  // console.log("id, oldId   " + req.params.convId + " " + oldId);
  try {
    const userIdToReset = id;

    // Update the conversation by resetting the hasNewMsg for the specific userId
    await Conversations.updateOne(
      {
        _id: req.params.convId, // The ID of the conversation to update
        "convParticipants.userId": userIdToReset, // Match the specific userId in convParticipants
      },
      {
        $set: { "convParticipants.$.hasNewMsg": 0 }, // Reset hasNewMsg for the matched userId
      }
    );
    await Conversations.updateOne(
      {
        _id: oldId, // The ID of the conversation to update
        "convParticipants.userId": userIdToReset, // Match the specific userId in convParticipants
      },
      {
        $set: { "convParticipants.$.hasNewMsg": 0 }, // Reset hasNewMsg for the matched userId
      }
    );
    // senas variantas be socket
    const oneConv = await Conversations.aggregate(
      // [
      //   {
      //     $match: {
      //       _id: new mongoose.Types.ObjectId(req.params.convId),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "convParticipants.userId",
      //       foreignField: "_id",
      //       as: "convParticipants1",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "messages.ownerId",
      //       foreignField: "_id",
      //       as: "messageOwners",
      //     },
      //   },
      //   {
      //     $addFields: {
      //       messages: {
      //         $map: {
      //           input: "$messages",
      //           as: "message",
      //           in: {
      //             message: "$$message.message",
      //             ownerId: "$$message.ownerId",
      //             createdAt: "$$message.createdAt",
      //             owner: {
      //               $arrayElemAt: [
      //                 {
      //                   $filter: {
      //                     input: "$messageOwners",
      //                     as: "owner",
      //                     cond: {
      //                       $eq: ["$$owner._id", "$$message.ownerId"],
      //                     },
      //                   },
      //                 },
      //                 0,
      //               ],
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $project: {
      //       __v: 0,
      //       convParticipants: 0,
      //       messageOwners: 0,
      //     },
      //   },
      // ],
      [
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
                    _id: "$$message._id", // Include the message _id
                    message: "$$message.message",
                    ownerId: "$$message.ownerId",
                    createdAt: "$$message.createdAt",
                    likes: "$$message.likes",
                    owner: {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$messageOwners",
                                as: "owner",
                                cond: {
                                  $eq: ["$$owner._id", "$$message.ownerId"],
                                },
                              },
                            },
                            as: "owner",
                            in: {
                              _id: "$$owner._id", // Include the owner's _id
                              name: "$$owner.name", // Include any other fields you need from the owner
                              email: "$$owner.email",
                              photo: "$$owner.photo",
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
              "convParticipants1.password": 0, // Exclude password from convParticipants1
              messageOwners: 0, // Exclude the intermediate messageOwners array
            },
          },
        ],
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    );
    req.oneConv = oneConv;

    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.sendDataById = async (req, res) => {
  res.status(200).json(req.oneConv[0]);
};
exports.notifyClientBySocket = async (req, res) => {
  sendCoteMessageNotifyClient(req.oneConv).then((response) => {
    // console.log(response);
  });
  res.status(200).json(req.oneConv[0]);
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
            // messages: { $push: "$messages" },
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
    likes: [],
  };
  try {
    // const oneConversation = await Conversations.findOneAndUpdate(
    //   { _id: toConv },
    //   {
    //     $push: { messages: newMessage },
    //     $inc: { "convParticipants.$[].hasNewMsg": 1 },
    //   },
    //   { new: true }
    // );

    const excludedUserId = userId;

    const oneConversation = await Conversations.findOneAndUpdate(
      { _id: toConv },
      {
        $push: { messages: newMessage },
        $inc: {
          "convParticipants.$[elem].hasNewMsg": 1,
        },
      },
      {
        arrayFilters: [{ "elem.userId": { $ne: excludedUserId } }],
        new: true,
      }
    );

    const oneConv = await Conversations.aggregate(
      // [
      //   {
      //     $match: {
      //       _id: new mongoose.Types.ObjectId(toConv),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "convParticipants.userId",
      //       foreignField: "_id",
      //       as: "convParticipants1",
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "messages.ownerId",
      //       foreignField: "_id",
      //       as: "messageOwners",
      //     },
      //   },
      //   {
      //     $addFields: {
      //       messages: {
      //         $map: {
      //           input: "$messages",
      //           as: "message",
      //           in: {
      //             message: "$$message.message",
      //             ownerId: "$$message.ownerId",
      //             createdAt: "$$message.createdAt",
      //             likes: [],
      //             owner: {
      //               $arrayElemAt: [
      //                 {
      //                   $filter: {
      //                     input: "$messageOwners",
      //                     as: "owner",
      //                     cond: {
      //                       $eq: ["$$owner._id", "$$message.ownerId"],
      //                     },
      //                   },
      //                 },
      //                 0,
      //               ],
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       convParticipants1: 1,
      //       lastMessage: {
      //         $arrayElemAt: [
      //           "$messages",
      //           { $subtract: [{ $size: "$messages" }, 1] },
      //         ],
      //       },
      //     },
      //   },
      // ],
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(toConv),
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
                  _id: "$$message._id", // Include the message _id
                  message: "$$message.message",
                  ownerId: "$$message.ownerId",
                  createdAt: "$$message.createdAt",
                  likes: "$$message.likes", // Assuming likes is part of the message schema
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
            _id: 1, // Keep the conversation _id
            convParticipants1: 1, // Keep the participants info
            lastMessage: {
              $let: {
                vars: {
                  lastMsg: {
                    $arrayElemAt: [
                      "$messages",
                      { $subtract: [{ $size: "$messages" }, 1] },
                    ],
                  },
                },
                in: {
                  _id: "$$lastMsg._id", // Add _id to the lastMessage object
                  message: "$$lastMsg.message",
                  ownerId: "$$lastMsg.ownerId",
                  createdAt: "$$lastMsg.createdAt",
                  likes: "$$lastMsg.likes",
                  owner: "$$lastMsg.owner",
                },
              },
            },
          },
        },
      ],
      { maxTimeMS: 60000, allowDiskUse: true }
    );
    // console.log(oneConv);
    return oneConv;
  } catch (error) {
    // res.status(400).json({ message: error.message });
    return error;
  }
};

exports.addnewparticipant = async (req, res) => {
  const { convId } = req.params;
  const { userId } = req.body;
  const { id } = req.tokenInfo;
  const newParticipant = {
    hasNewMsg: 0,
    userId: userId,
  };
  try {
    const oneUpdatedConversation = await Conversations.findOneAndUpdate(
      { _id: convId },
      {
        $push: { convParticipants: newParticipant },
        // $inc: { "convParticipants.$[].hasNewMsg": 1 },
      },
      { new: true }
    );

    // console.log(oneUpdatedConversation);
    const conversationsList = await Conversations.aggregate(
      [
        {
          $match: {
            "convParticipants.userId": new mongoose.Types.ObjectId(id),
          },
        },
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
            // messages: { $push: "$messages" },
          },
        },
      ],
      {
        maxTimeMS: 60000,
        allowDiskUse: true,
        collation: "",
      }
    );
    const oneConv = await Conversations.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(convId),
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
    sendCoteMessageNotifyClientRenevdata(oneConv).then((response) => {
      // console.log(response);
    });
    // console.log(conversationsList);
    res.status(200).json(conversationsList);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
exports.deleteConvById = async (req, res, next) => {
  const { id } = req.tokenInfo;
  const { convId } = req.params;

  try {
    const oneConv = await Conversations.aggregate(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(convId),
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
    const deletedConversation = await Conversations.findByIdAndDelete(convId);
    if (deletedConversation) {
      // console.log("Conversation deleted:", deletedConversation);
      sendCoteMessageNotifyClientRenevdata(oneConv).then((response) => {
        // console.log(response);
      });
    } else {
      console.log("No conversation found with that ID.");
    }

    res
      .status(201)
      .json({ message: "Pokalbis ištrintas", deletedConversation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.addLike = async (req, res, next) => {
  try {
    const { id } = req.tokenInfo;
    const { convId, msgId, userId } = req.body;

    // console.log(convId + msgId + userId);
    const conversation = await Conversations.updateOne(
      {
        _id: new mongoose.Types.ObjectId(convId),
        "messages._id": new mongoose.Types.ObjectId(msgId),
      },
      { $addToSet: { "messages.$.likes": new mongoose.Types.ObjectId(userId) } } // Add userId to the likes array if not already present
    );
    // console.log(conversation);
    if (conversation.modifiedCount > 0) {
      const oneConv = await Conversations.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(convId),
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
                  _id: "$$message._id", // Include the message _id
                  message: "$$message.message",
                  ownerId: "$$message.ownerId",
                  createdAt: "$$message.createdAt",
                  likes: "$$message.likes", // Include the likes array
                  owner: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: "$messageOwners",
                              as: "owner",
                              cond: {
                                $eq: ["$$owner._id", "$$message.ownerId"],
                              },
                            },
                          },
                          as: "owner",
                          in: {
                            _id: "$$owner._id", // Include the owner's _id
                            name: "$$owner.name", // Include any other fields you need from the owner
                            email: "$$owner.email",
                            photo: "$$owner.photo",
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
            "convParticipants1.password": 0, // Exclude password from convParticipants1
            messageOwners: 0, // Exclude the intermediate messageOwners array
          },
        },
      ]);
      // console.log(oneConv);
      // console.log("Cote žinutė iškeliavo");

      sendCoteMessageNotifyClientRenevdataOneConv(oneConv).then((response) => {
        // console.log("Cote Cote informavo apie pristatymą");
      });

      res.status(201).json({ message: "Like pridėtas", oneConv });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
