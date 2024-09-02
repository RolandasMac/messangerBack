const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

//Cote service********
const {
  sendCoteMessage,
  sendCoteMessageDisconectedUser,
  sendCoteMessageGetNewChatMessage,
  convService,
  convService1,
  convService2,
} = require("./plugin");
// const { log } = require("console");
//*********************************

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static(path.join(__dirname, "public")));

// Conected to socket users DB

let conectedUsers = [];

// Handle socket connections
io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);
  io.to(socket.id).emit("renewUserData");
  // Listen for custom data on connection
  socket.on("clientInfo", (data) => {
    const newData = { ...data, socketId: socket.id };
    // console.log("Client data received:", newData);

    // send cote message ********
    sendCoteMessage(newData).then((response) => {
      console.log("response", response);
      // Broadcast the message to all connected clients
      // io.to(socket.id).emit("message", { time, data: fraze });
    });
    //******************************* */

    // const conectedUser = { ...data, socketId: socket.id };
    // const index = conectedUsers.findIndex((cur) => cur.id === data.id);
    // if (index >= 0) {
    //   conectedUsers[index] = conectedUser;
    // } else {
    //   conectedUsers.push(conectedUser);
    // }

    // // Optionally join a room based on received data
    // if (data.room) {
    //   socket.join(data.room);
    //   console.log(`User ${socket.id} joined room ${data.room}`);
    // }

    // You can send an acknowledgment or further data back to the client
    socket.emit("welcomeMessage", {
      message: `Welcome to the server, ${data.username}!`,
      conectedUsers: conectedUsers,
    });
    socket.broadcast.emit(
      "fetchUsers"
      //  {
      //   message: `User ${data.username} conected to the server, !`,
      //   conectedUser: conectedUser,
      // }
    );
  });

  // Join a room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Handle chat message
  socket.on("chatMessage", (data) => {
    // console.log(data);
    sendCoteMessageGetNewChatMessage(data).then((response) => {
      // console.log("response", response);
      response.convParticipants1.forEach((element) => {
        if (element.socketId.length) {
          // console.log(element.socketId);
          io.to(element.socketId).emit("newmessage", response);
        }
      });
    });
  });
  // User disconected event
  socket.on("userdisconected", async () => {
    // console.log("user disconected" + socket.id);
    // send cote message ********
    sendCoteMessageDisconectedUser({ socketId: socket.id }).then((response) => {
      console.log("response", response);
      io.emit(
        "fetchUsers"
        //  {
        //   message: `User ${data.username} conected to the server, !`,
        //   conectedUser: conectedUser,
        // }
      );
      // Broadcast the message to all connected clients
      // io.to(socket.id).emit("message", { time, data: fraze });
    });
    //******************************* */

    // let disconectedUser = await conectedUsers.find(
    //   (cur) => cur.socketId === socket.id
    // );
    // console.log(`${disconectedUser.username} disconnected`);
    // conectedUsers = conectedUsers.filter((cur) => cur.socketId !== socket.id);
    // io.emit("disconecteduser", {
    //   message: `User ${disconectedUser.username} disconected from the server, !`,
    //   // user: disconectedUser,
    // });
  });

  // Handle user disconnect
  socket.on("disconnect", async () => {
    console.log("user disconected" + socket.id);
    // send cote message ********
    sendCoteMessageDisconectedUser({ socketId: socket.id }).then((response) => {
      console.log("response", response);
      io.emit(
        "fetchUsers"
        //  {
        //   message: `User ${data.username} conected to the server, !`,
        //   conectedUser: conectedUser,
        // }
      );
      // Broadcast the message to all connected clients
      // io.to(socket.id).emit("message", { time, data: fraze });
    });
    //******************************* */

    // let disconectedUser = await conectedUsers.find(
    //   (cur) => cur.socketId === socket.id
    // );
    // console.log(`${disconectedUser.username} disconnected`);
    // conectedUsers = conectedUsers.filter((cur) => cur.socketId !== socket.id);
    // io.emit("disconecteduser", {
    //   message: `User ${disconectedUser.username} disconected from the server, !`,
    //   // user: disconectedUser,
    // });
  });
});

// Cote service**************************

// const convService = new cote.Responder({
//   name: "Conv Service responder",
//   key: "Conv_Service_key",
// });

convService.on("NotifyClient", async (req, cb) => {
  // console.log("Gaiti duomenys");
  // console.log(req.data);
  // const result = await conversationsController.sendMessage(req);
  // console.log(req.data[0], convParticipants1);

  // console.log("_iūrėti čia" + req.data[0]);

  // const lastMessage = {
  //   lastMessage: req.data[0].messages[req.data[0].messages.length - 1],
  //   _id: req.data[0]._id,
  // };
  // const lastMessage = {
  //   lastMessage: req.data[0].messages[req.data[0].messages.length - 1],
  //   _id: req.data[0]._id,
  // };

  req.data[0].convParticipants1.forEach((element) => {
    if (element.socketId.length) {
      // console.log(element.socketId);
      io.to(element.socketId).emit("newmessage", req.data[0]);
    }
  });
  cb("Ok");
});
convService1.on("NotifyClientRenewData", async (req, cb) => {
  // console.log("Žinutė gautaaaaa" + req.data[0]);
  const convId = req.data[0]._id;
  // console.log(convId);
  req.data[0].convParticipants1.forEach((element) => {
    if (element.socketId.length) {
      // console.log(element.socketId);
      io.to(element.socketId).emit("renewData", convId);
    }
  });
  cb("Ok");
});
convService2.on("NotifyClientRenewOneConvData", async (req, cb) => {
  console.log("Žinutė gautaaaaa");
  console.log(req.data);
  const convId = req.data[0]._id;
  // console.log(convId);
  req.data[0].convParticipants1.forEach((element) => {
    if (element.socketId.length) {
      // console.log(element.socketId);
      io.to(element.socketId).emit("renewOneConvData", convId);
    }
  });
  cb("Ok");
});
// ******************************************

const PORT = process.env.SOCKET_PORT || 5004;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
