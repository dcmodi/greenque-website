const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    order_date : {
        type : String,
        required : true
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    products : {
        type : Object,
        required : true
    },
    total : {
        type : Number
    },
    delivery_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'delivery'
    },
    payment_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'payment'
    }
})

module.exports = mongoose.model('order',orderSchema)