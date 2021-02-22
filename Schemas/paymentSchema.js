const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    payment_status : {
        type : String,
        default : "pending"
    },
    payment_Date : {
        type : Date,
    },
    payment_method : {
        type : String,
        default : "COD"
    },
    /*order_ID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'order'
    }*/
})

module.exports = mongoose.model('payment',paymentSchema)