const nodemailer = require("nodemailer");
const sendEmail=async (to,subject,text)=>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.APP_PASSWORD, 
        },
      });
    
      const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
      };
    
      await transporter.sendMail(mailOptions);
}

module.exports=sendEmail;