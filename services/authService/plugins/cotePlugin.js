const cote = require("cote");

const client = new cote.Requester({
  name: "Inform that User avatar is changed",
  key: "Auth_Service_key",
});

const sendCoteMessageToinformAvatarChange = (data) => {
  return new Promise((resolve) => {
    client.send({ type: "renewUserData", data }, (getData) => {
      //   console.log(time);
      resolve(getData);
    });
  });
};

module.exports = {
  sendCoteMessageToinformAvatarChange,
};
