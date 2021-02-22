const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    Product_name:  {
        type: String,
        required: 'This field is required.'
    },
    img_src: {
        type: String,
        required : true
    },
    Sale_Price: {
        type: Number,
        required: 'This field is required.'
    },
    Qty : {
        type:Number,
        required: 'This field is required.'
    },
    categories : {
        type : [String],
        required : true
    }
})

const product = mongoose.model('product',productSchema)
module.exports = product