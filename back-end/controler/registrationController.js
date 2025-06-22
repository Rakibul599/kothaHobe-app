const User = require("../models/People");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utilities/sendEmail");
async function newRegisteruser(req, res, next) {
  let newUser;
  let hashedPassword = await bcrypt.hash(req.body.password, 10);
  // console.log(req.file.filename)

  const code = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (req.file) {
    newUser = User({
      ...req.body,
      password: hashedPassword,
      avater: req.file.filename,
      verificationCode: code,
      verificationCodeExpires: expires,
    });
  } else {
    newUser = User({
      ...req.body,
      password: hashedPassword,
      avater: null,
      verificationCode: code,
      verificationCodeExpires: expires,
    });
  }

  try {
    let result = await newUser.save();
    let to = result.email;
    let code = result.verificationCode;
    let subject = "KothaHobe App registration";
    let text = `
Hi ${result.name},

Your verification code is: ${code}

Please use this within 10 minutes to verify your account.

Thanks,
KothaHobeApp
`;
    sendEmail(to, subject, text);
    let finalrespose = {
      id: result._id,
      name: result.name,
      email: result.email,
    };
    res.status(200).send(finalrespose);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
async function verify(req, res, next) {
  console.log(req.body.id);
  let finduser =await User.findOne({ _id: req.body.id });
  if(!finduser) return res.status(404).json({ error: 'User not found.' });
//   console.log(finduser)
// ;
if(finduser.isVerified===true) return res.status(404).json({ error: 'User is already verified' });
if (
    finduser.verificationCode === req.body.code &&
    finduser.verificationCodeExpires > new Date()
  ) {
    finduser.isVerified = true;
    finduser.verificationCode = undefined;
    finduser.verificationCodeExpires = undefined;
    let result=await finduser.save();
    let to = result.email;
    let subject = "KothaHobe App registration successfully";
    let text = `
Hi ${result.name},

Thanks for registration KothaHobe App! 

KothaHobeApp
`;
sendEmail(to,subject,text);
    res.status(200).json({ txt: 'Email verified successfully!' });
//   res.status(200).json();
}else {
    res.status(400).json({ error: 'Invalid or expired code.' });
  }
}
module.exports = {
  newRegisteruser,
  verify,
};
