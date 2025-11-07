// const nodemailer = require("nodemailer");
// const sendEmail=async (to,subject,text)=>{
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL,
//           pass: process.env.APP_PASSWORD, 
//         },
//       });
    
//       const mailOptions = {
//         from: process.env.EMAIL,
//         to,
//         subject,
//         text,
//       };
    
//       await transporter.sendMail(mailOptions);
// }

// module.exports=sendEmail;

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    await transporter.verify();
    console.log("SMTP Server is ready to take messages");

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (err) {
    console.error("Error sending email:", err.message);
  }
};

module.exports = sendEmail;
