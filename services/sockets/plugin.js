const cote = require("cote");
const client = new cote.Requester({
  name: "User Service requester",
  key: "User_Service_key",
});

const sendCoteMessage = (data) => {
  return new Promise((resolve) => {
    client.send({ type: "auth", data }, (data) => {
      //   console.log(time);
      resolve(data);
    });
  });
};
const client1 = new cote.Requester({
  name: "User Service requester",
  key: "User_Service_key",
});
const sendCoteMessageDisconectedUser = (data) => {
  return new Promise((resolve) => {
    client1.send({ type: "disconect", data }, (data) => {
      //   console.log(time);
      resolve(data);
    });
  });
};
const client2 = new cote.Requester({
  name: "Conv Service requester",
  key: "Conv_Service_key",
});
const sendCoteMessageGetNewChatMessage = (data) => {
  return new Promise((resolve) => {
    client2.send({ type: "chatMsg", data }, (data) => {
      //   console.log(time);
      resolve(data);
    });
  });
};

// Cote service**************************

const convService = new cote.Responder({
  name: "Conv Service responder",
  key: "Convers_Service_key",
});
const convService1 = new cote.Responder({
  name: "Conv Service responder",
  key: "ConversDel_Service_key",
});
const convService2 = new cote.Responder({
  name: "Conv Service responder",
  key: "ConversAddLike_Service_key",
});
const convService3 = new cote.Responder({
  name: "Conv Service responder",
  key: "Auth_Service_key",
});

// convService.on("chatMsg", async (req, cb) => {
//   // console.log(req.data);
//   const result = await conversationsController.sendMessage(req);
//   // console.log(result[0]);
//   cb(result[0]);
// });

// ******************************************

module.exports = {
  sendCoteMessage,
  sendCoteMessageDisconectedUser,
  sendCoteMessageGetNewChatMessage,
  convService,
  convService1,
  convService2,
  convService3,
};
