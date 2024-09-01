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
const client2 = new cote.Requester({
  name: "Conversation notify con was deleted",
  key: "ConversDel_Service_key",
});

const sendCoteMessageNotifyClientRenevdata = (data) => {
  return new Promise((resolve) => {
    client2.send({ type: "NotifyClientRenewData", data }, (getData) => {
      console.log("išsiųsta");
      resolve(getData);
    });
  });
};

module.exports = {
  sendCoteMessageToGetClientData,
  sendCoteMessageNotifyClient,
  sendCoteMessageNotifyClientRenevdata,
};
