const Order = require('../Schemas/OrderSchema.js')
const Delivery = require('../Schemas/deliverySchema.js')
const Payment = require('../Schemas/paymentSchema.js')
const Mongoose = require('mongoose')
const ManageProduct = require('../Schemas/product.js')
const OrderSchema = require('../Schemas/OrderSchema.js')
const ManageCategory = require('../Schemas/CategorySchema.js')

const checksum_lib = require("../Paytm/checksum");
const config = require("../Paytm/config");
const bcrypt = require('bcryptjs')
const User = require('../Schemas/User.js')


var ProductController = () => {
    return {
        getShop: async (req, res) => {
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            let category = await ManageCategory.find()
            let product = await ManageProduct.find()
            res.render('./ejs/shop.ejs', { products: product, category: category })
        },
        postShop: async (req, res) => {
            
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            let category = await ManageCategory.find()
            let product = {}
            if(typeof (req.body.category) == "undefined" && typeof (req.body.price) == "undefined"){
                product = await ManageProduct.find()
            }
            else if (typeof (req.body.category) != "undefined" && typeof (req.body.price) != "undefined") {
                if (req.body.price == "high") {
                    product = await ManageProduct.find({ categories: req.body.category }).sort({ 'Sale_Price': -1 })
                }
                else {
                    product = await ManageProduct.find({ categories: req.body.category }).sort({ 'Sale_Price': 1 })
                }
            }
            else if (typeof (req.body.category) == "undefined" || typeof (req.body.price) == "undefined") {
                if (typeof (req.body.category) == "undefined") {
                    if (req.body.price == "high") {
                        product = await ManageProduct.find().sort({ 'Sale_Price': -1 })
                    }
                    else {
                        product = await ManageProduct.find().sort({ 'Sale_Price': 1 })
                    }
                }
                else{
                    product = await ManageProduct.find({ categories: req.body.category })
                }
            }
            else {
                product = await ManageProduct.find({ categories: req.body.category })
            }
            res.render('./ejs/shop.ejs', { products: product, category: category })
        },
        getShopByCategory: async (req, res) => {
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            let cat = await ManageCategory.find()
            let category = await ManageCategory.findOne({ _id: req.params.id })
            let product = await ManageProduct.find({ categories: { $all: [category.category_name] } })
            res.render('./ejs/shop.ejs', { products: product, category: cat })
        },
        getProduct: async (req, res) => {
            let category = await ManageCategory.find()
            res.render('./ejs/admin/product_update.ejs', { viewTitle: "Insert Product", product: {}, cat: category })
        },
        postProduct: (req, res) => {
            //console.log(req.body._id)
            if (req.body._id == '')
                insertRecord(req, res);
            else
                updateRecord(req, res);
        },
        getList: (req, res) => {
            ManageProduct.find((err, docs) => {
                if (!err) {
                    //console.log(docs)
                    res.render("./ejs/admin/product.ejs", {
                        list: docs
                    });
                }
                else {
                    console.log('Error in retrieving Products list:' + err);
                }

            })
        },
        getUpdate: async (req, res) => {
            let category = await ManageCategory.find()
            ManageProduct.findById(req.params.id, (err, doc) => {
                if (!err) {
                    res.render("./ejs/admin/product_update.ejs", {
                        viewTitle: "Update Product",
                        product: doc,
                        cat: category
                    });
                }
            })
        },
        deleteProduct: (req, res) => {
            ManageProduct.findByIdAndRemove(req.params.id, (err, doc) => {
                if (!err) {
                    res.redirect('/admin/ManageProduct/list');
                }
                else { console.log('Error in product delete:' + err); }
            })
        },
        getCheckout: async (req, res) => {
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            res.render('./ejs/checkout.ejs', {
                cart: req.session.cart
            })
        },
        postCheckout: async (req, res) => {
            res.locals.u = req.user || {}
            res.locals.c = await getCategoryName()
            if (!req.body.fname || !req.body.lname || !req.body.address1 || !req.body.address2 || !req.body.zip) {
                req.flash('err', 'All Fields Are Required')
                return res.redirect('/checkout')
            }
            if (emailValidation(req.body.email)) {
                req.flash('email', 'Provide valid Email ID')
                return res.redirect('/checkout')
            }
            if (numberValidation(req.body.mob)) {
                req.flash('mob', 'Enter Valid Mobile number')
                return res.redirect('/checkout')
            }
            else {
                let { order } = placeOrder(req)
                makePayment(req, res, order)
            }
        },
        getOrder: (req, res) => {
            if (req.user) {
                Order.find({ user_id: req.user._id })
                    .then(o => {
                        //console.log(o)
                        res.render('./ejs/order.ejs', { user: req.user, order: o })
                    })
                    .catch(err => {
                        console.log(err)
                    })

            }
            else {
                res.render('./ejs/order.ejs', { user: req.user || {}, order: {} })
            }
        },
        getAdminOrder: async (req, res) => {
            Order.find({})
                .populate('user_id', 'name')
                .populate('delivery_id', 'delivery_status')
                .populate('payment_id', 'payment_status')
                .exec()
                .then(o => {
                    
                    res.render('./ejs/admin/AdminOrder.ejs', { order: o })
                   // console.log(o)
                })
                .catch(err => {
                    console.log(err)
                })

        },

        postOrderStatus: (req, res) => {
            console.log(req.body)

            Order.findOne({ _id: req.body.order_id })
                .then(o => {
                    Delivery.updateOne({ _id: o.delivery_id }, { delivery_status: req.body.delivery_status }, (err, data) => {
                        if (!err) {
                            res.redirect('/admin/manageorder')
                        }
                    })
                })
                .catch(err => {
                    console.log(err)
                })

        },

        //Payment
        postPaymentStatus: (req, res) => {
            Order.findOne({ _id: req.body.order_id })
                .then(o => {
                    Payment.updateOne({ _id: o.payment_id }, { payment_status: req.body.payment_status }, (err, data) => {
                        if (!err) {
                            res.redirect('/admin/manageorder')
                        }
                    })
                })
                .catch(err => {
                    console.log(err)
                })

        },
        paymentCompleted: async (req, res) => {
            console.log(req.body)
            if (req.body.RESPCODE == "01") {
                Order.findOne({ _id: req.body.ORDERID })
                    .then(o => {
                        Payment.updateOne({ _id: o.payment_id }, { $set: { payment_method: 'online', payment_status: 'received' } })
                            .then(p => {
                                let cartSchema = {
                                    items: [],
                                    totalQty: 0,
                                    totalPrice: 0
                                }
                                req.session.cart = cartSchema
                                res.redirect('/cart')
                            })
                            .catch(err => {
                                console.log(err)
                            })
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
            else {
                const order = await Order.findOne({ _id: req.body.ORDERID })
                Delivery.findOneAndDelete({ _id: order.delivery_id }, (err, doc) => {
                    if (err) {
                        console.log(err)
                    }
                })
                Payment.findOneAndDelete({ _id: order.payment_id }, (err, doc) => {
                    if (err) {
                        console.log(err)
                    }
                })
                Order.findOneAndDelete({ _id: order._id }, (err, doc) => {
                    if (err) {
                        console.log(err)
                    }
                })
                req.flash('error', 'Payment Failed..')
                res.redirect('/cart')
            }

        },

        //Category
        getCategoryList: (req, res) => {
            ManageCategory.find()
                .then(c => {
                    //console.log(c)
                    res.render('./ejs/admin/category.ejs', { list: c })
                })
                .catch(err => {
                    console.log("Error")
                })
        },
        getCategory: (req, res) => {
            res.render('./ejs/admin/category_update.ejs', { category: {} })
        },
        postCategory: (req, res) => {
            if (req.body._id == '')
                insertCategoryRecord(req, res);
            else
                updateCategroyRecord(req, res);
        },
        getUpdateCategory: (req, res) => {
            ManageCategory.findById(req.params.id, (err, doc) => {
                if (!err) {
                    res.render("./ejs/admin/category_update.ejs", {
                        category: doc
                    });
                }
            })
        },
        deleteCategory: (req, res) => {
            console.log(req.body, req.params)
            ManageProduct.find({ Category_ID: req.params.id })
                .then(p => {
                    if (Object.keys(p).length != 0) {
                        req.flash('err', 'Change All Records of Catgory that you want to remove.')
                        res.redirect('/admin/managecategory/list')
                    }
                    else {
                        ManageCategory.findByIdAndRemove(req.params.id, (err, doc) => {
                            if (!err) {
                                console.log('Record Deleted.')
                                res.redirect('/admin/managecategory/list');
                            }
                            else { console.log('Error in product delete:' + err); }
                        })
                    }
                })

        },

        //delivery
        getDelivery : async (req,res)=>{
            let delivery = await Delivery.findById({ _id : req.params.id })
            res.render('./ejs/admin/delivery-details.ejs',{ delivery : delivery})
        },
        postDelivery : async (req,res)=>{
            if(req.body.delivery == "" || numberValidation(req.body.num)){
                req.flash('err','All Fields Required.')
                let url = "/admin/delivery-details/" + req.body._id
                res.redirect(url)
            }
            else{
                let d = await Delivery.updateOne({ _id : req.body._id} , { deliveredBy : req.body.delivery , delivery_boy_num : req.body.num})
            }
            res.redirect('/admin/manageorder')
        }
    }
}

function insertRecord(req, res) {
    console.log(req.files)
    if (req.files) {
        var file = req.files.img
        console.log(file)
        var filename = file.name
        console.log(filename)
        req.files.img.mv('G:/DARSHAN/College Project/Views/img/' + filename, function (err) {
            if (err) {
                //res.send("Error")
            }
            else {
                //res.send ('Image Uploaded successfully.')
            }
        })
    }
    console.log(req.body)
    var product = new ManageProduct({
        Product_name: req.body.Product_name,
        img_src: filename,
        Sale_Price: req.body.Sale_Price,
        Qty: req.body.Qty
    })

    product.save((err, doc) => {
        if (!err) {
            console.log(doc)
            return res.redirect('/admin/ManageProduct/list');
        }

        else {
            if (err.name == 'ValidationError') {
                console.log("Err")
                handleValidationError(err, req.body);
                return res.render("./ejs/admin/product_update.ejs", {
                    viewTitle: "Insert Product",
                    product: req.body
                });


            }
            else

                console.log("Error during Record Insertion:" + err);
        }
    });

}

function updateRecord(req, res) {
    ManageProduct.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
        if (!err) {
            console.log(doc)
            res.redirect('/admin/ManageProduct/list');
        }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("ManageProduct/addOrEdit", {
                    viewTitle: 'Update Employee',
                    product: req.body
                });
            }
            else
                console.log('Error during record update:' + err);
        }

    });
}

function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'Product_name':
                body['ProductNameError'] = err.errors[field].message;
                break;
            case 'img_src':
                body['ImageSourceError'] = err.errors[field].message;
                break;
            case 'Sale_Price':
                body['SalePriceError'] = err.errors[field].message;
                break;
            case 'Qty':
                body['QuantityError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

var placeOrder = (req) => {
    let name = req.body.fname + " " + req.body.lname
    let address = req.body.address1 + " , " + req.body.address2 + " , " + req.body.zip
    let delivery = new Delivery({
        delivery_Address: address,
        contact_no: req.body.mob,
        name : name
    })
    delivery.save()
        .then(d => {
            //console.log(d)
        })
        .catch(err => {
            console.log(err)
        })
    let payment = new Payment({
    })

    payment.save()
        .then(p => {
            //console.log(p)
        })
        .catch(err => {
            console.log(err)
        })
    let date = new Date()
    let today = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear()
    let order = new Order({
        order_date: today,
        user_id: req.user._id,
        products: req.session.cart,
        total: 2000,
        delivery_id: delivery._id,
        payment_id: payment._id
    })
    order.save()
        .then(o => {
            //console.log(o)
        })
        .catch(err => {
            console.log(err)
        })
    return { order }
}

var insertCategoryRecord = (req, res) => {
    if (req.body.category_name == '') {
        req.flash('err', 'All Fields Are Required.')
        res.redirect('/admin/managecategory')
    }
    else {
        let category = new ManageCategory({
            category_name: req.body.category_name
        })

        category.save()
            .then(c => {
                console.log("Record Inserted.")
                res.redirect('/admin/managecategory/list')
            })
            .catch(err => {
                console.log(err)
            })
    }
}

var updateCategroyRecord = (req, res) => {
    ManageCategory.updateOne({ _id: req.body._id }, { category_name: req.body.category_name })
        .then(c => {
            console.log("Product Updated.")
            res.redirect('/admin/managecategory/list')
        })
        .catch(err => {
            console.log("error")
        })
}

var emailValidation = (email) => {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
        //console.log("Email Validated")
        return false
    }
    else {
        return true
    }
}

var numberValidation = (mob) => {
    if (!mob) {
        return true
    }
    if (/^(\+\d{1,3}[- ]?)?\d{10}$/.test(mob)) {
        return false
    }
    else {
        return true
    }
}

var makePayment = (req, res, order) => {
    var cartSchema = {
        items: [],
        totalQty: 0,
        totalPrice: 0
    }
    if (req.body.paymentMethod == "cod") {
        req.session.cart = cartSchema
        res.redirect('/cart')
    }
    else {
        let num = req.user.phone_no;
        let str = num.toString()
        let id = req.user._id.toString()
        console.log(str, typeof str, typeof id)
        var paymentDetails = {
            amount: (req.session.cart.totalPrice).toString(),
            customerId: id,
            customerEmail: req.user.email,
            customerPhone: str
        }
        if (!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
            res.status(400).send('Payment failed')
        }
        else {
            var params = {};
            params['MID'] = process.env.MID;
            params['WEBSITE'] = 'WEBSTAGING';
            params['CHANNEL_ID'] = 'WEB';
            params['INDUSTRY_TYPE_ID'] = 'Retail';
            params['ORDER_ID'] = order._id.toString()
            params['CUST_ID'] = paymentDetails.customerId;
            params['TXN_AMOUNT'] = paymentDetails.amount;
            params['CALLBACK_URL'] = 'http://localhost:3300/payment-completed';
            params['EMAIL'] = paymentDetails.customerEmail;
            params['MOBILE_NO'] = paymentDetails.customerPhone;
            try {
                let checksum = checksum_lib.genchecksum(params, '@2Y7t1P1@a%61IcZ', function (err, checksum) {
                    if (err) {
                        console.log("err", err)
                    }
                    var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging

                    var form_fields = "";
                    for (var x in params) {
                        form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
                    }
                    form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
                    res.end();
                    console.log("CheckSum" + checksum)
                })
            }
            catch (err) {
                console.log(err)
                res.redirect('/cart')
            }
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

module.exports = ProductController