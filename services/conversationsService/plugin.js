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

module.exports = {
  sendCoteMessageToGetClientData,
};
