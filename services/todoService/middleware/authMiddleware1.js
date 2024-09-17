const { sendCoteMessageToGetClientData } = require("../../authService/plugin");
module.exports = {
  authMiddleware1: (req, res, next) => {
    const token = req.cookies.authtoken;
    // const token = req.body.token;
    // console.log(req.cookies.authtoken);
    // console.log(token + "123");
    sendCoteMessageToGetClientData(token).then((response) => {
      // console.log("response123", response);
      if (!response) {
        return res
          .status(401)
          .json({ success: false, message: "Autorizavimo klaidda serveryje" });
      }
      req.tokenInfo = response;
      next();
    });
    // next();
  },
};
