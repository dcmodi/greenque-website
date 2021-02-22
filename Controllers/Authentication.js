var authentication = ()=>
{
    return{
        isUser : (req,res,next)=>{
            if(req.user.isUser)
                return true
            else
                return false
        },
        isAdmin : (req,res,next)=>{
            if(req.isAuthenticated()){
                if(!req.user.isUser){
                    //console.log(req.user.isUser)
                    next()
                }
                    
                else
                    return res.redirect(req.headers.referer || '/')
            }
            else
                return res.redirect(req.headers.referer || '/')
        },
        isLoggedIn : (req,res,next)=>{
            if(req.isAuthenticated())
            {
                return res.redirect('/')
            }   
            else
                next()
        },
        login : (req,res,next)=>{
            if(req.isAuthenticated())
            {
                next()
            }   
            else
                return res.redirect('/login')
        },
        logout : (req,res,next)=>{
            if(req.isAuthenticated())
                next()
            else
                res.redirect('/login')
            
        },
        forgot_password: (req,res,next)=>{
            if(req.isAuthenticated())
                return res.redirect('/')
            else
                next()
        }
    }
}

module.exports = authentication