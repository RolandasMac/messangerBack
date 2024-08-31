const cote = require("cote");
const client = new cote.Requester({
  name: "Conversation middleware requester",
  key: "Conc_Service_key",
});

const sendCoteMessageToGetClientData = (token) => {
  return new Promise((resolve) => {
    client.send({ type: "getAuthDataToConv", token }, (getData) => {
      //   console.log(time);
      resolve(getData);
    });
  });
};
const client1 = new cote.Requester({
  name: "Conversation notify new msg send",
  key: "Convers_Service_key",
});

const sendCoteMessageNotifyClient = (data) => {
  return new Promise((resolve) => {
    client1.send({ type: "NotifyClient", data }, (getData) => {
      // console.log("išsiųsta");
      resolve(getData);
    });
  });
};

module.exports = {
  sendCoteMessageToGetClientData,
  sendCoteMessageNotifyClient,
};
