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
const sendCoteMessageDisconectedUser = (data) => {
  return new Promise((resolve) => {
    client.send({ type: "disconect", data }, (data) => {
      //   console.log(time);
      resolve(data);
    });
  });
};
module.exports = {
  sendCoteMessage,
  sendCoteMessageDisconectedUser,
};
