// controllers/contactsController.js
const sendMail = require("../plugins/emailPlugin1");

exports.sendEmailMessage = async (req, res) => {
  const { email, subject, name, text } = req.body;

  const sendEmail = await sendMail(name, email, subject, text);
  try {
    return res
      .status(200)
      .json({ message: sendEmail.message, success: true, data: text });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
