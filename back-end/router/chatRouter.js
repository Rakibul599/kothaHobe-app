const express=require('express');
const checkAuth = require('../middlewares/auth/cheackAuth');
const uploadAttachment = require('../middlewares/attachment/attachment');
const { loginAuth } = require('../controler/loginController');
const { addUser, addConversion, conversationItem, sendMessage, getMessage, isSeen } = require('../controler/chatController');

const router=express.Router();
router.get('/',checkAuth,loginAuth);
router.post('/adduser',checkAuth,addUser);
router.post('/chatconversion',checkAuth,addConversion);
router.get('/conversationitem',checkAuth,conversationItem);
router.post('/sendmessage',checkAuth,uploadAttachment,sendMessage);
router.get('/messages/:conversation_id',checkAuth,getMessage);
router.post('/seen',checkAuth,isSeen);
module.exports=router 
