// routes/contactsRoutes.js
const express = require("express");
const contactsController = require("../controllers/contactsController");
const router = express.Router();

// const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/sendemailmessage", contactsController.sendEmailMessage);

module.exports = router;
