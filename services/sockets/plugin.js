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
module.exports = {
  sendCoteMessage,
  sendCoteMessageDisconectedUser,
  sendCoteMessageGetNewChatMessage,
};
