const jwt = require("jsonwebtoken");

module.exports = {
  authMiddleware: (req, res, next) => {
    const token = req.cookies.authtoken;
    console.log(token);
    // console.log("Gaidokenas" + token);
    // if (!token) {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: "Jūs esate neautorizuotas" });
    // }
    // let decoded = {};
    // if (token) {
    //   const secretKey = process.env.JWT_KEY;
    //   decoded = jwt.verify(token, secretKey);
    //   console.log(decoded);
    //   console.log(token);
    // }

    // res.status(200).json({ success: false, message: decoded });
    // req.tokenInfo = token;
    // return;
    next();
  },
};
