const mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
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
    Category_ID : {
        type : String,
        required : true
    }
});

const product=mongoose.model('Product', ProductSchema);
module.exports=product


