const { application } = require('express')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = process.env.PORT || 5000
const {MONGOURI} = require('./config/keys')

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
  });

//Connect to the server
mongoose.connect(MONGOURI, {
    useNewUrlParser:true,
    useUnifiedTopology: true,
})

//If connects successfully
mongoose.connection.on('connected', ()=>{
    console.log('connected to mongo!')
})

//If fails to connect
mongoose.connection.on('error', (err)=>{
    console.log("Failed to connect to mongo!",err)
})

//After connection is established then 
require('./models/users')
require('./models/post')

app.use(express.json())
//uses middleware to authenticate web tokens
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

//if application has deployed on heroku
if(process.env.NODE_ENV=="production"){
    //First thing is to static files in client/build (html/css files)
    app.use(express.static('client/build'))
    const path = require('path')
    //whenever any request is called it will send index.html, which holds all of our react data
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

//PORT check
app.listen(PORT,()=>{
    console.log("server is running: on", PORT)
})

/////UNUSED CODE from S2.3 - S2.4

// //Middleware is used to load something in between pages. This allows you to allow pages to check for login before loading pages, etc
// const customMiddleware = (req,res,next)=>{
//     console.log("middleware executed!!")
//     next()
// }

// //commented out. If this is here it uses it on each page.
// //app.use(customMiddleware)

// ////This section is ued to map out the webpage//////

// //Home or index
// app.get('/',(req,res)=>{
//     console.log("home")
//     res.send("hello world")
// })

// //About page
// //By adding customMiddleware before the (req,res) it loads it first.
// app.get('/about',customMiddleware,(req,res)=>{
//     console.log("about")
//     res.send("about page")
// })