const mongoose = require('mongoose')

const deliverySchema = new mongoose.Schema({
    deliveredBy : {
        type : String
    },
    delivery_Address : {
        type : String
    },
    delivery_Date : {
        type : String,
        default : Date.now()
    },
    contact_no : {
        type : Number
    },
    delivery_status : {
        type : String,
        default : 'pending'
    },
    name : {
        type : String
    },
    delivery_boy_num : {
        type : String
    }
    /*order_ID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'order'
    }*/
})

module.exports = mongoose.model('delivery',deliverySchema)