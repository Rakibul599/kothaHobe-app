const express=require('express');
const { loggedIn } = require('../controler/loginController');


const router=express.Router();
router.post('/',loggedIn)

module.exports=router;