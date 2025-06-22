const express=require('express');
const { newRegisteruser, verify } = require('../controler/registrationController');
const { newUservalidators, newUserValidationHandler } = require('../middlewares/registration/registrationValidators');
const uploads = require('../middlewares/avater/avater');



const router=express.Router();
// const upload = multer();
router.post('/',uploads,newUservalidators,newUserValidationHandler,newRegisteruser);
router.put('/verify',verify)
// router.post('/',upload.none(),newRegisteruser);


module.exports=router;