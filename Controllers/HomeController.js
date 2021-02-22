const { compareSync } = require('bcryptjs')
const { get } = require('mongoose')
const ManageCategory = require('../Schemas/CategorySchema.js')
const ManageProduct = require('../Schemas/product.js')


let getCategoryName = ()=>{
        return ManageCategory.find()
        .then(c=>{
            return c
            //console.log(c)
        })
        .catch(err=>{
        })
}
var homeController = () => {
    return {
        index: async (req, res) => {
            user = req.user || {}
            if (Object.keys(user).length == 0 || user.isUser) {
                res.locals.u = req.user || {}
                res.locals.c = await getCategoryName()
                //console.log(res.locals)
                let product = await ManageProduct.find()
                
                res.render('./ejs/home.ejs', { user: user , products : product})
            }
            else {
                res.render('./ejs/admin/home.ejs')
            }

        },
        about: async (req, res) => {
            res.locals.u = req.user || {}
            res.locals.c  =await  getCategoryName()
            res.render('./ejs/about.ejs')
        }
    }
}


module.exports = homeController