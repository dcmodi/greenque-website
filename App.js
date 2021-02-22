const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const methodOverride = require('method-override')
const flash = require('express-flash')
const path = require('path')
const upload = require('express-fileupload')
const mongoStore = require('connect-mongo')(session)


require('G:/DARSHAN/College Project/Controllers/passport_strategy.js')
require('dotenv').config()
const app=express()
const db=process.env.DB

//connect DataBase
mongoose.connect(db,{ useNewUrlParser : true, useUnifiedTopology : true })
.then(()=>{
    console.log("DataBase Connected...")
})
.catch(err=>{
    console.log(err);
})

//Mongo Store
const store= new mongoStore({
    mongooseConnection : mongoose.connection,
    collection : 'session'
})


//
app.use(express.static(__dirname + '/views'));
//ejs
app.set('views', path.join(__dirname+ '/views'));
app.set('view engine','ejs');

//Body Parser
app.use(express.urlencoded({ extended:false }));


//static files
app.use("/views",express.static('./views/'));
//Making Session
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    store : store,
    saveUninitialized: false,
    cookie: { secure: false,maxAge : 60 * 60 * 24 * 30 }
  }))

//Setting File Upload
app.use(upload())

//Using Flash
app.use(flash())



//adding passport
app.use(passport.initialize());
app.use(passport.session());

//Overridig a Method
app.use(methodOverride('_method'))


//Calling Routes
require('G:/DARSHAN/College Project/Routes/route.js')(app)


//Port
let port=process.env.PORT || 5000
app.listen(port,()=>{

    console.log("Port Listening on "+port)
})