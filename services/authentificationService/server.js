const path = require("path");
const dotenv = require("dotenv");
const cote = require("cote");
const jwt = require("jsonwebtoken");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const AuthentificationService = new cote.Responder({
  name: "Authentification token respond",
  key: "Conc_Service_key",
});

AuthentificationService.on("getAuthDataToConv", async (req, cb) => {
  // console.log(req.token);
  const user = jwt.decode(req.token, process.env.JWT_KEY);
  cb(user);
});
