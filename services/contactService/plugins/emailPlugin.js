const nodemailer = require("nodemailer");

const emailTemplate = (text, name, email) => `
   <div style="padding: 16px; text-align: center; font-family: Arial, sans-serif;">
        <div style="background-color: white; padding: 24px; max-width: 500px; margin: auto;">
            <div style="display: block; margin-bottom: 16px;">
                <h1>Nuo svetainės lankytojo:</h1>
                <div style="font-size: 24px; float: left;">${name}</div>
                <div style="font-size: 12px; float: right;">${email}</div>
                <div style="clear: both;"></div>
            </div>
            <div style="height: 1px; opacity: 50%; background-color: #afafaf; width: 100%; margin-top: 20px; margin-bottom: 20px"></div>
            <h1 style="font-size: 24px; font-weight: 600;">Jūs gavote žinutę</h1>
            <div style="padding: 32px; background-color: #f3f4f6; font-size: 40px;">${text}</div>
        </div>
        <div style="color: #9ca3af; font-size: 10px;">Copyright © ${new Date().getFullYear()} - All right reserved by Ship App</div>
    </div>

`;

const emailPlugin = {
  sendEmail: async (name, email, subject, text) => {
    // console.log("name:", name);
    // console.log("email:", email);
    // console.log("subject:", subject);
    // console.log("text:", text);

    try {
      if (!name || !email || !subject || !text) {
        throw new Error("Visi laukaeliai turi būti užpildyti");
      }

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          // user: process.env.GMAIL,
          // pass: process.env.GMAIL_PASS,
          user: "nenarkotikams@gmail.com",
          pass: "qrhhedlzasmmyhqt",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        // from: process.env.GMAIL,
        from: email,
        to: "rolandas.macius@gmail.com",
        subject: subject,
        html: emailTemplate(text, name, email),
      };

      await transporter.sendMail(mailOptions);

      return { message: "Žinutė sėkmingai išsiųsta" };
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send email. Please try again.");
    }
  },
};

module.exports = emailPlugin;
