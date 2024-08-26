const cote = require("cote");
const client = new cote.Requester({
  name: "Image Service requester",
});

const sendCoteImage = async (obj) => {
  const req = {
    type: "image",
    val: obj,
  };
  // console.log("Gaidys");
  const response = await client.send(req);
  // console.log(response);
  process.exit();
  // return response;
};

const makeRequest = (req) => client.send(req);

module.exports = {
  makeRequest,
  sendCoteImage,
};
