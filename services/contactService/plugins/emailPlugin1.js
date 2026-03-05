const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// 1. Nustatykite savo OAuth2 kredencialus
// GAUTI iš Google Cloud Console (jūsų sukurto OAuth 2.0 kliento ID)
const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;

// Nukreipimo URI (turi atitikti tai, kas nurodyta Google Cloud Console)
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // Arba jūsų serverio callback URL
// Pvz., jei naudojate savo serverį, tai gali būti 'http://localhost:3000/auth/google/callback'

// Refresh Tokenas (GAUTAS VIENĄ KARTĄ ATLIEKANT AUTENTIFIKAVIMO SRAUTĄ)
// Paprastai šį gausite po to, kai vartotojas pirmą kartą prisijungs ir suteiks leidimą.
// Rekomenduojama jį saugoti saugiai (pvz., duomenų bazėje)
const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Nustatome refresh tokeną, kad galėtume gauti naujus access tokenus
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(name, emailTo, subject, html) {
  try {
    console.log("sendMail: ", emailTo, subject, html);
    // 2. Gaukite naują access tokeną naudodami refresh tokeną
    const accessToken = await oAuth2Client.getAccessToken();
    // console.log("access Token: ", accessToken.token);
    // 3. Sukurkite Nodemailer transporterį
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER, // Jūsų Gmail adresas
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // 4. Nustatykite el. laiško parinktis
    const mailOptions = {
      from: `"${name}" email <${emailTo}>`,
      to: "rolandas.macius@gmail.com",
      subject: subject,
      html: html,
    };

    // 5. Išsiųskite el. laišką
    const result = await transporter.sendMail(mailOptions);
    // console.log("El. laiškas sėkmingai išsiųstas:", result);
    // console.log(result.accepted.length > 0);
    if (result && result.accepted.length > 0) return true;
    return false;
  } catch (error) {
    console.error("Klaida siunčiant el. laišką:", error);
    throw error;
  }
}

// Paleiskite funkciją
// sendMail();

module.exports = sendMail;
