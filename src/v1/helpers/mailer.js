const { createTransport } = require("nodemailer");
const { EMAIL } = require("../../../config");
const { logger } = require("./logger");

module.exports = async (options) => {
  try {
    const { to, subject, html } = options;
    const transporter = createTransport({
      host: EMAIL.host,
      port: EMAIL.port,
      secure: EMAIL.secure,
      auth: {
        user: EMAIL.user,
        pass: EMAIL.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: EMAIL.user,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result ? true : false;
  } catch (error) {
    logger.error(error.stack);
    return false;
  }
};
