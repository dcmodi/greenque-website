const mongoose = require('mongoose');

var ManageOfferSchema = new mongoose.Schema({
    Offer_Desc:  {
        type: String,
        required: 'This field is required.'
    },
    isActivated: {
        type: Boolean,
        default: false
        
    },
    Offer_StartDate: {
        type: Date,
        required: 'This field is required.'
    
    },
    Offer_EndDate: {
        type: Date,
        required: 'This field is required.'
    
    }

});
module.exports = mongoose.model('Offers', ManageOfferSchema);

