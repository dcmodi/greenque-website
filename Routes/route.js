var AuthController=require('../Controllers/AuthController.js')
var home=require('../Controllers/HomeController.js')
const passport = require('passport')
const auth = require('../Controllers/Authentication.js')
const productController = require('../Controllers/ProductController.js')
const OfferController = require('../Controllers/OfferController.js')
const cartController = require('../Controllers/CartController.js')
const authController = require('../Controllers/AuthController.js')

var initRoutes = (app)=>{
    //Login Routes
    app.get('/login',auth().isLoggedIn,AuthController().getLogin)
    app.post('/login',auth().isLoggedIn,
    AuthController().postLogin,
    (req,res,next)=>{
        next()
    })
    
    //Registration Routes
    app.get('/register',auth().isLoggedIn,AuthController().getRegister)
    app.post('/register',auth().isLoggedIn,AuthController().postRegister)

    //Logout User
    app.delete('/logout',auth().logout,AuthController().logout)

    //Sending Email
    app.get('/mail',auth().forgot_password,AuthController().getMail)
    app.post('/mail',auth().forgot_password,AuthController().postMail)

    //forgot-password
    app.get('/forgot-password/:token',auth().forgot_password,AuthController().getForgotPassword)
    app.post('/forgot-password/:token',auth().forgot_password,AuthController().postForgotPassword)

    //view Profile
    app.get('/profile',AuthController().getProfile)
    app.get('/update-profile',AuthController().getUpdateProfile)
    app.post('/update-profile',AuthController().postUpdateProfile)


    //Home Route
    app.get('/',home().index)

    //About Route
    app.get('/about',home().about)

    //shop Route
    app.get('/shop',productController().getShop)
    app.post('/shop',productController().postShop)

    app.get('/shop/:id',productController().getShopByCategory)
    
    //Cart Routes
    app.get('/cart',cartController().index)
    app.get('/add-to-cart/:id',cartController().add_to_cart)
    app.post('/update-cart',cartController().update_cart)
    app.get('/delete-cart-product/:id',cartController().delete_cart_product)
    
    
    //check out
    app.get('/checkout',auth().login,productController().getCheckout)
    app.post('/checkout',auth().login,productController().postCheckout)
    
    //Order Routes
    app.get('/orders',productController().getOrder)
    app.post('/payment-completed',productController().paymentCompleted)
    
    //ADMIN ROUTES
    
    //Product Routes
    app.get('/admin/ManageProduct',auth().isAdmin,productController().getProduct)
    app.post('/admin/ManageProduct',auth().isAdmin,productController().postProduct)

    //View Product
    app.get('/admin/ManageProduct/list',auth().isAdmin,productController().getList)

    //Update Product
    app.get('/admin/ManageProduct/:id',auth().isAdmin,productController().getUpdate)
    //Delete Product
    app.get('/admin/ManageProduct/delete/:id',auth().isAdmin,productController().deleteProduct)

    //Order
    app.get('/admin/manageorder',auth().isAdmin,productController().getAdminOrder)

    app.post('/admin/manageorder/status',auth().isAdmin,productController().postOrderStatus)
    app.post('/admin/managepayment/status',auth().isAdmin,productController().postPaymentStatus)

    //Offer Routes
    app.get('/admin/offers',auth().isAdmin,OfferController().getOffer)
    app.post('/admin/offers',auth().isAdmin,OfferController().postOffer)

    //View Offers
    app.get('/admin/offers/list',auth().isAdmin,OfferController().getList)

    //Update Offers
    app.get('/admin/offers/:id',auth().isAdmin,OfferController().getUpdate)
    //Delete Offers
    app.get('/admin/offers/delete/:id',auth().isAdmin,OfferController().deleteOffer)

    //Category
    app.get('/admin/managecategory',auth().isAdmin,productController().getCategory)
    app.post('/admin/managecategory',auth().isAdmin,productController().postCategory)
    app.get('/admin/managecategory/list',auth().isAdmin,productController().getCategoryList)
    app.get('/admin/managecategory/:id',auth().isAdmin,productController().getUpdateCategory)
    app.get('/admin/managecategory/delete/:id',auth().isAdmin,productController().deleteCategory)

    //View Customer
    app.get('/admin/viewCustomer',auth().isAdmin,authController().getCustomer)

    //Delivery 
    app.get('/admin/delivery-details/:id',auth().isAdmin,productController().getDelivery)
    app.post('/admin/delivery-details',auth().isAdmin,productController().postDelivery)
}

module.exports = initRoutes