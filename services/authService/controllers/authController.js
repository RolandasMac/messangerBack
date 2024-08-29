// controllers/userController.js
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const emailPlugin = require("../plugins/emailPlugin");
const authPlugin = require("../plugins/authPlugin");
const { makeRequest, sendCoteImage } = require("../plugins/imagePlugin");
const cote = require("cote");
const client = new cote.Requester({ name: "Client" });
const jwt = require("jsonwebtoken");

// Generate a 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendEmailCode = async (req, res) => {
  const { email } = req.body;

  const subject = "Email tikrinimas";
  const userEmail = await User.findOne({ email: email }).select("email");
  // console.log(userEmail);
  // console.log("iki čia ateina");
  if (userEmail) {
    return res.status(200).json({
      message: "Toks el. paštas jau egzistuoja",
      success: false,
    });
  }
  const code = generateVerificationCode();
  // code = "123456";
  const data = authPlugin.saveEmail(email, code);
  const sendEmail = await emailPlugin.sendVerifyEmail(email, subject, code);
  try {
    return res
      .status(200)
      .json({ message: sendEmail.message, success: true, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  console.log(req.body);

  const { code, name, password1 } = req.body;
  const email = authPlugin.getEmailByCode(code);
  if (!email) {
    return res.status(400).json({ success: false, error: "Neteisingas kodas" });
  }
  try {
    // let image1 = await sendCoteImage(image);

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(password1, salt);
    const password = passHash;
    const newUser = await User.create({
      name: name,
      password: password,
      email: email,
      photo: req.imageurl,
    });
    res.status(201).json({
      message: "new user was created",
      createdUser: {
        name: newUser.name,
        email: newUser.email,
        photo: newUser.photo,
      },
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // const user = await User.findOne({ email: email });
    const user = await User.findOneAndUpdate(
      { email: email },
      { isOnline: true, lastloggedAt: new Date() },
      { new: true }
    );
    if (!user) {
      res.status(401).json({ success: false, message: "Tokio vartotojo nėra" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Blogas slaptažodis" });
    }
    const JWT_key = process.env.JWT_KEY;
    const token = jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      JWT_key
    );

    res.cookie("authtoken", token, {
      // can only be accessed by server requests
      httpOnly: true,
      // path = where the cookie is valid
      path: "/",
      // domain = what domain the cookie is valid on
      domain: "localhost",
      // secure = only send cookie over https
      secure: true,
      // sameSite = only send cookie if the request is coming from the same origin
      sameSite: "lax", // "strict" | "lax" | "none" (secure must be true)
      // maxAge = how long the cookie is valid for in milliseconds
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      success: true,
      message: "Jūs sėkmingai prisijungėte",
      token: token,
      userData: {
        email: user.email,
        id: user._id,
        name: user.name,
        photo: user.photo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastloggedAt: user.lastloggedAt,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.autologin = async (req, res) => {
  // res.status(200).json({ success: false, message: "Labas" });
  const { token } = req.body;
  if (!token) {
    res.status(401).json({ success: false, message: "Jūs turite prisijungti" });
  }
  const payload = jwt.decode(token);
  console.log(payload);
  try {
    // const user = await User.findOne({ email: payload.email });
    const user = await User.findOneAndUpdate(
      { email: payload.email },
      { isOnline: true, lastloggedAt: new Date() },
      { new: true }
    );

    if (!user) {
      res.status(401).json({ success: false, message: "Tokio vartotojo nėra" });
    }
    const JWT_key = process.env.JWT_KEY;
    const token = jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      JWT_key
    );
    res.status(200).json({
      success: true,
      message: "Jūs sėkmingai prisijungėte",
      token: token,
      userData: {
        email: user.email,
        id: user._id,
        name: user.name,
        photo: user.photo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastloggedAt: user.lastloggedAt,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    if (!allUsers) {
      return res.status(404).json({ message: "Users not found" });
    }
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOneUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
exports.test = async (req, res) => {
  res.cookie("authtoken", "Gaidys", {
    maxAge: 900000,
    httpOnly: true, // The cookie is accessible only by the web server
    secure: false, // Send cookie over HTTPS only
    sameSite: "Strict", // Cookie will only be sent in a first-party context
  });
  res.status(200).json("Ok");
};
exports.testgauti = async (req, res) => {
  res.status(200).json(req.tokenInfo);
};
