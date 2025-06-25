const express=require('express');
const http=require('http');
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const testData = require('./models/testSchema');
const resisterRouter=require('./router/resisterRouter')
const loginRouter=require('./router/loginRouter')
const chatRouter=require('./router/chatRouter')
const path=require('path')


const app=express();
const server=http.createServer(app);

dotenv.config();

// socket creation
// const io = require("socket.io")(server);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.ORIGIN, // your frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});
global.io = io;
//database connection
mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING)
.then(()=>console.log("Database connected"))
.catch((err)=>console.log(err))
app.use(cookieParser(process.env.COOKIE_SECRET)); 
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "public")));
// app.use('/uploads/avatars', express.static(path.join(__dirname, 'public/uploads/avatars')));

// app.use(cors());
app.use(cors({
  origin: process.env.ORIGIN, // Replace with your frontend origin
  credentials: true,              // Allow cookies to be sent
}));
// app.use('public/', express.static(path.join(__dirname, 'public/uploads/avatars/')));
// console.log(__dirname)
app.use('/images',express.static("public"));

//route handle
app.use('/registration', resisterRouter);
app.use('/login',loginRouter)
app.use('/chats',chatRouter)
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong!' });
  });
server.listen(process.env.PORT,()=>{
    console.log(`app listening port ${process.env.PORT}`)
})