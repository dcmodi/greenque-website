const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const USER = require('G:/DARSHAN/College Project/Schemas/User.js')



passport.use(new localStrategy({usernameField:'email'},
  async (email, password, done)=> {
    try{
        if(email.length == 0 || password.length == 0){
          console.log("Hello")
          return done(null,false,{message : 'All Fields Required'})
        }
        const user= await USER.findOne({ email });
        if(!user){
            return done(null,false,{ message : 'User Not Found '})
        }
        else{
            bcrypt.compare(password,user.password,(err,isMatched)=>{
                console.log(isMatched)
                if(isMatched){
                    //console.log('success')
                    return done(null,user)
                }
                else{
                    //console.log('Fail')
                    return done(null,false,{ message : 'Username or Password Incorrect.'})
                }
            })
        }               
    }
    catch(e){
      done(e);
      console.log(e);
    }
    
  }
));


passport.serializeUser((user, done )=> {
    //console.log(user)
    done(null, user._id);
});
passport.deserializeUser(async function(_id, done) {
  try{
    const user = await USER.findOne({_id });
    //console.log(user)
    done(null, user);
  }
  catch(e){
    done(e);
    console.log(e);
  }
});
