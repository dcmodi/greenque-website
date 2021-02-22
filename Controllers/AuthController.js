const USER = require('../Schemas/User.js')
const authentication = require('../Controllers/Authentication.js')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const mailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const ManageCategory = require('../Schemas/CategorySchema.js')

require('../Controllers/passport_strategy.js')

var authController = ()=>{
    return{
        //login
        getLogin : async(req,res)=>{
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            req.session.referer = req.headers.referer || '/'
            
            if(req.isAuthenticated()){
                //res.redirect('/logout')
            }
            else
                res.render('./ejs/login.ejs',{ data : {},user : {}})
            
        },
        postLogin : async (req,res)=>{ 
            //console.log(req.session.referer)
            
            let url = req.session.referer || '/'
            delete req.session.referer
            if(url == '/register'){
                url = '/'
            }
            if((req.body.email).length == 0 || (req.body.password).length == 0 ){
                req.flash('err','All Fields Are Required.')
                res.redirect('/login')  
            }
            passport.authenticate('local',{successRedirect :url ,failureRedirect : '/login',failureFlash : true})(req,res)
        },
        //logout
        logout : (req,res)=>{
            req.logOut()
            res.redirect('/')
        },
        //register
        getRegister :async (req,res)=>{
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            if(req.isAuthenticated())
            {
                res.redirect('/')
            }
            else
            {
                res.render('./ejs/register.ejs',{ data : {} })
            }
            
        },
        postRegister : (req,res)=>{
            var flag = 0
            USER.findOne({ email : req.body.email })
            .then(async user=>{
                if(user)
                {
                    console.log(user)
                    req.flash('err','User Already Exists.')
                    res.redirect('/register')
                }
                else
                {
                    if(nameValidation(req.body.name)){
                        req.flash('name','Name must not be Empty')
                        flag=1
                    }
                    if(emailValidation(req.body.email)){
                        req.flash('email','Provide Valid Email-ID')
                        flag=1
                    }
                    if(numberValidation(req.body.mobile)){
                        req.flash('num','Enter Valid Mobile Number.')
                        flag=1
                    }
                    if(pwdValidation(req.body.password)){
                        req.flash('pwd','Password length must be between 8 to 13.\nPassword must contain one lowecase,one uppercase,one digit,one spacial character.')
                        flag=1
                    }
                    if(req.body.password != req.body.pwd){
                        req.flash('matchpwd','Password Must be Same.')
                        flag=1
                    }
                    if(flag==0){
                        try{
                            var pwd = await bcrypt.hash(req.body.password,10)
                            const newUser = new USER(
                                {
                                    name : req.body.name,
                                    email : req.body.email,
                                    phone_no : req.body.mobile,
                                    password : pwd
                                }
                            )
                            newUser.save()
                            res.redirect('/login')

                        }
                        catch{
                            res.render('./ejs/register.ejs')
                        }
                    }
                    else{
                        res.redirect('/register')
                    }
                    
                }
            })
            
        },

        //Sending Mail
        getMail : (req,res)=>{
            
            res.render('./ejs/mail.ejs')
        },
        postMail : (req,res)=>{
            if(emailValidation(req.body.email)){
                req.flash('err','Provide Valid Email ID.')
                return res.redirect('/mail')
            }
            USER.findOne({ email : req.body.email},(err,user)=>{
                if(err || !user){
                    req.flash('err','User Not Found.')
                    return res.redirect('/mail')
                }
                else{
                    let token = jwt.sign({id : user._id},process.env.ForgotPasswordKey,{expiresIn:'10m'})
                    console.log(token)
                    USER.updateOne({ _id : user._id},{$set : {resetLink : token}},(err,updated)=>{
                        if(!err){
                            console.log("record Updated")
                        }
                    })
                    const transporter = mailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user : 'darshanmodi300@gmail.com',
                            pass : 'Darshanmodi@1310'
                            }
                        })
                        
                        var link = "http://localhost:3300/forgot-password/"+token
                        var mailOptions = {
                        from:'darshanmodi300@gmail.com',
                        to: req.body.email,
                        subject : 'Forgot Password Request',
                        html : `<h1>Click following Link for changing Password :</h1>
                        <a href="${link}">click here</a>`
                    }
                    transporter.sendMail(mailOptions,(err,info)=>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            return res.send("Mail Sent SuccessFully.")
                        }
                    })
                }
            })
        },
        //Forgot Password
        getForgotPassword : (req,res)=>{
            res.render('./ejs/forgotPassword.ejs',{ token : req.params.token})
        },
        postForgotPassword : (req,res)=>{
            jwt.verify(req.params.token,process.env.ForgotPasswordKey,async (err,decoded)=>{
                if(err){
                    console.log(err)
                }
                else{
                    if(!(pwdValidation(req.body.newPwd)) && !(pwdValidation(req.body.reEnterPwd))){
                        if(req.body.reEnterPwd == req.body.newPwd){
                            var pwd = await bcrypt.hash(req.body.newPwd,10)
                            USER.updateOne({_id : decoded.id},{$set : {password : pwd}},(err,updated)=>{
                                if(err){
                                    return res.send("Failed to change password")
                                }
                                else{
                                    return res.send("Password Updated")
                                }
                            })
                        }
                    }
                    else{
                        return res.send("Error")
                    }
                }
            })
            
        },

        //Profile
        getProfile : async(req,res)=>{
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            if(req.user){
                    //console.log(req.user)
                    res.render('./ejs/profile.ejs',{ user : req.user,err:{}})
                }
            else{
                res.render('./ejs/profile.ejs',{ err : "You must have to Login to continue:", user:{} })
            }
            
            
        },

        //Update Profile
        getUpdateProfile : (req,res)=>{
            res.render('./ejs/UpdateProfile.ejs',{ user : req.user || {}})
        },
        postUpdateProfile : (req,res)=>{
            var myquery = {_id:req.user._id}
            var newvalues = { $set: {name:req.body.name,email:req.body.email,phone_no:req.body.phone_no} };
            USER.updateOne(myquery, newvalues, function(err, res) {
            if (err){
                throw err;
            } 
            console.log("1 document updated")
            });
            USER.findOne({_id:req.user._id})
            .then(async user=>{
                //console.log(user)
                res.redirect('/profile')
            });               
        },
        getCustomer :async (req,res)=>{
            let customer = await USER.find()
            res.render('./ejs/admin/customer.ejs',{ customer : customer })
        }
    }
}

let returnCategory = async ()=>{
    let category = await ManageCategory.find()
    return category
}

var emailValidation =  (email)=>{
    if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email))
    {
        //console.log("Email Validated")
        return false
    }
    else
    {
        return true
    }
}
var nameValidation = (name)=>{
    if(!name)
    {
        return true
    }
    else
    {
        if(/^[A-Za-z\s]+$/.test(name))
        {
            //console.log("Name Validated")
            return false
        }
        else
        {
            return true
        }
    }
}
var pwdValidation = (pwd)=>{
    if(!pwd){
        return true
    }
    if(pwd.length < 8 || pwd.length >13)
    {
        return true 
    }
    else
    {
        if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/.test(pwd))
        {
            //console.log("Pwd Validated")
            return false
        }
        else
        {
            return true
        }
    }
}
var numberValidation =  (mob)=>{
    
    var m = Number(mob)
    
    
    if(!m){
        return true
    }
    if(/^(\+\d{1,3}[- ]?)?\d{10}$/.test(m)){
        return false
    }
}
let getCategoryName = ()=>{
    return ManageCategory.find()
    .then(c=>{
        return c
        //console.log(c)
    })
    .catch(err=>{
    })
}
module.exports = authController