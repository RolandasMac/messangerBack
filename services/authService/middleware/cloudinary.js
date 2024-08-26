const cote = require("cote");
const client = new cote.Requester({ name: "Client" });

const getCloudinaryurl = (req, res, next) => {
  //Gauname cloudinary nuorodą per cote
  let imageurl = null;
  // console.log(req);
  const body = {
    type: "image",
    val: req.file.path,
  };
  client.send(body, (data) => {
    req.imageurl = data.secure_url;
    // res.status(200).json(data.secure_url);
    next();
  });
  //*********** */
};

module.exports = getCloudinaryurl;
