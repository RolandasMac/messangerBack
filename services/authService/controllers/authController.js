// controllers/userController.js
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const emailPlugin = require("../plugins/emailPlugin");
const authPlugin = require("../plugins/authPlugin");
const { makeRequest, sendCoteImage } = require("../plugins/imagePlugin");
const cote = require("cote");
const client = new cote.Requester({ name: "Client" });
const jwt = require("jsonwebtoken");
const {
  sendCoteMessageToinformAvatarChange,
} = require("../plugins/cotePlugin");
const HOST = process.env.HOST;
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
  // console.log(req.body);

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
      domain: HOST,
      // secure = only send cookie over https
      secure: true,
      // sameSite = only send cookie if the request is coming from the same origin
      sameSite: "none", // "strict" | "lax" | "none" (secure must be true)
      // maxAge = how long the cookie is valid for in milliseconds
      maxAge: 36000000, // 10 hour
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
  console.log(req.params.id);
  try {
    const user = await User.findById(req.params.id);
    const {
      createdAt,
      email,
      _id,
      isOnline,
      lastloggedAt,
      name,
      photo,
      updatedAt,
    } = user;
    const newUser = {
      createdAt,
      email,
      id: _id,
      _id,
      isOnline,
      lastloggedAt,
      name,
      photo,
      updatedAt,
    };
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("authtoken", { httpOnly: true });
    res.status(200).json({
      success: true,
      message: "Jūs sėkmingai atsijungėte",
      userData: {
        email: "",
        id: "",
        name: "",
        photo: "",
        createdAt: "",
        updatedAt: "",
        lastloggedAt: "",
        isOnline: false,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.testas = async (req, res) => {
  // res.cookie("authtoken", "Gaidys", {
  //   maxAge: 900000,
  //   httpOnly: true, // The cookie is accessible only by the web server
  //   secure: false, // Send cookie over HTTPS only
  //   sameSite: "Strict", // Cookie will only be sent in a first-party context
  // });
  console.log("Gaidys veikia");
  res.status(200).json({ message: "Gaidys" });
};
exports.testgauti = async (req, res) => {
  res.status(200).json(req.tokenInfo);
};

exports.changeAvatar = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: req.tokenInfo.email }, // Find the user by email
      { photo: req.imageurl }, // Update the photo
      { new: true } // Return the updated document
    );

    sendCoteMessageToinformAvatarChange(updatedUser._id).then((response) => {
      // console.log("Cote Cote informavo apie pristatymą");
    });

    res.status(201).json({
      message: "new user was created",
      updatedUser,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.changePassword = async (req, res) => {
  const userInfo = req.tokenInfo;
  const { password, password1, password2 } = req.body;
  // console.log(userInfo + password + password1 + password2);

  // const { code, name, password1 } = req.body;
  // const email = authPlugin.getEmailByCode(code);
  // if (!email) {
  //   return res.status(400).json({ success: false, error: "Neteisingas kodas" });
  // }
  try {
    const user = await User.findOneAndUpdate(
      { email: userInfo.email },
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
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(password1, salt);
    const changedPassword = passHash;
    const updatedUser = await User.findOneAndUpdate(
      { email: userInfo.email }, // Filter by email
      { password: changedPassword }, // Update the password
      { new: true, useFindAndModify: false } // Options: return the updated document
    );

    res.status(201).json({
      message: "The password has been changed!",
      userData: updatedUser,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.changeEmail = async (req, res) => {
  const userInfo = req.tokenInfo;
  const { password, code, email } = req.body;
  const newEmail = authPlugin.getEmailByCode(code);
  if (!newEmail) {
    return res.status(400).json({ success: false, error: "Neteisingas kodas" });
  }
  // console.log("Čia dar veikia");
  try {
    const user = await User.findOneAndUpdate(
      { email: userInfo.email },
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
    // console.log("Čia dar veikia");

    const updatedUser = await User.findOneAndUpdate(
      { email: userInfo.email }, // Filter by email
      { email: newEmail }, // Update the email
      { new: true, useFindAndModify: false } // Options: return the updated document
    );

    res.status(201).json({
      message: "The email has been changed!",
      userData: updatedUser,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
