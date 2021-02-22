const Mongoose  = require('mongoose')
const ManageCategory = require('../Schemas/CategorySchema.js')
const ManageProduct = require('../Schemas/product.js')


module.exports = () => {
    return {
        index: async (req, res) => {
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            res.render('./ejs/cart.ejs',
            {
                cart : req.session.cart || {}
            })
        },
        add_to_cart: (req, res) => {
            
            let cartSchema = {
                items: [],
                totalQty: 0,
                totalPrice: 0
            }
            let cart = req.session.cart || cartSchema
            id = (req.params.id).substring(3)
            i = Mongoose.Types.ObjectId(id)
            ManageProduct.findOne({ _id: id })
                .then(product => {
                    let p = {
                        id: product._id,
                        name : product.Product_name,
                        price: product.Sale_Price,
                        qty: 1
                    }
                    let flg = 0
                    if (cart.items.length != 0) {
                        for(var i=0; i< cart.items.length; i++){
                            if ((cart.items[i].id).toString() == (product._id).toString()) {
                                cart.items[i].qty += 1
                                cart.totalQty += 1
                                cart.totalPrice += product.Sale_Price
                                flg = 1
                            }
                            
                        }
                        if (flg == 0) {
                            cart.items.push(p)
                            cart.totalQty += 1
                            cart.totalPrice += p.price
                        }
                    }
                    else {
                        cart.items.push(p)
                        cart.totalQty += 1
                        cart.totalPrice += p.price
                    }
                    req.session.cart = cart
                    //console.log( req.session.cart)
                    res.send("Product Added to Cart")
                })
                .catch(err => {
                    console.log(err)
                })


        },
        delete_cart_product : (req,res) =>{
            let cart = req.session.cart
            let newCart = {
                items: [],
                totalQty: 0,
                totalPrice: 0
            }
            for(var i=0;i < cart.items.length ; i++){
                if((cart.items[i].id).toString() == (req.params.id).toString()){
                    cart.totalQty = cart.totalQty - cart.items[i].qty
                    cart.totalPrice = cart.totalPrice - (cart.items[i].qty * cart.items[i].price)
                }
                else{
                    newCart.items.push(cart.items[i])
                }
            }
            newCart.totalQty = cart.totalQty
            newCart.totalPrice = cart.totalPrice
            req.session.cart = newCart
            console.log(req.session.cart)
            res.redirect('/cart')
        },
        update_cart : (req,res)=>{
            let cart = req.session.cart
            cart.items.forEach(item => {
                if( (item.id).toString() == (req.body.id).toString() ){
                    console.log(req.body.qty * item.price)
                    console.log(item.qty * item.price)
                    cart.totalPrice = cart.totalPrice + ( (req.body.qty * item.price) - (item.qty * item.price) )
                    cart.totalQty += req.body.qty - item.qty
                    item.qty = req.body.qty
                }
            });
            req.session.cart = cart
            res.redirect('/cart')
        }
    }
}
let getCategoryName = () => {
    return ManageCategory.find()
        .then(c => {
            return c
            //console.log(c)
        })
        .catch(err => {
        })
}