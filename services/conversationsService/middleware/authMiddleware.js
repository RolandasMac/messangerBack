const { sendCoteMessageToGetClientData } = require("../plugin");

module.exports = {
  authMiddleware: (req, res, next) => {
    const token = req.cookies.authtoken;
    // console.log(token + "123");
    sendCoteMessageToGetClientData(token).then((response) => {
      // console.log("response123", response);
      if (!response) {
        return res
          .status(401)
          .json({ success: false, message: "Autorizavimo klaida serveryje" });
      }
      req.tokenInfo = response;
      next();
    });
  },
};
