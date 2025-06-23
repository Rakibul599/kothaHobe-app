const { check, validationResult } = require("express-validator");
const User = require("../../models/People");
const path=require('path')
const { unlink } = require("fs");


const newUservalidators = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must not contain anything other than alphabet")
    .trim(),

  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });

      if (user) {
       if(user.isVerified===false)
       {
        await User.deleteOne({email:value});
        throw new Error("Please Resubmit Again");
       }
       else
        throw new Error("Email already in use");
      }
    }),

  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol"
    ),

];

const newUserValidationHandler = function (req, res, next) {
   console.log("hello")
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // remove uploaded files
    if (req.file) {
      
      unlink(
        path.join(__dirname, `../../public/uploads/avatars/${req.file.filename}`),
        (err) => {
          if (err) console.log(err);
        }
      );
    }

    // response the errors
    console.log(mappedErrors);
    res.status(200).json({
      errors: mappedErrors,
    });
  }
};

module.exports = { newUservalidators, newUserValidationHandler };
