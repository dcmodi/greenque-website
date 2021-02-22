const Mongoose  = require('mongoose');
const ManageOffer = require('../Schemas/OfferSchema.model.js')
const moment = require('moment')

var OfferController = ()=>{
    return {
        getOffer : (req,res)=>{
            res.render('./ejs/admin/offer_update.ejs',{ viewTitle : "Insert Offer",offer : {} })
        },
        postOffer : (req,res)=>{
            console.log(req.body._id)
            if (req.body._id == '')
                insertRecord(req,res);
            else
                updateRecord(req,res);
        },
        getList : (req,res)=>{
            ManageOffer.find((err , docs) => {
                if (!err) {
                    //console.log(docs)
                    res.render("./ejs/admin/offer_list.ejs",{
                        list: docs,
                        moment : moment
                    });
                }
                else {
                    console.log('Error in retrieving Offers list:' + err);
                }
        
            })
        },
        getUpdate : (req,res)=>{
            ManageOffer.findById(req.params.id, (err,doc) => {
                if (!err) {
                    res.render("./ejs/admin/offer_update.ejs", {
                        viewTitle: "Update Offer",
                        offer: doc
                    });
                }
            })
        },
        deleteOffer : (req,res)=>{
            ManageOffer.findByIdAndRemove(req.params.id, (err,doc) => {
                if (!err) {
                    res.redirect('/admin/offers/list');
                }
                else {console.log('Error in Offer delete:' +err);}
            })
            
        }
    }
}

function insertRecord(req,res){
    var offer = new ManageOffer({
        Offer_Desc: req.body.Offer_Desc,
        isActivated: req.body.isActivated ,
        Offer_StartDate: req.body.Offer_StartDate,
        Offer_EndDate: req.body.Offer_EndDate
    })
    
    offer.save((err,doc) => {
        if (!err)
        {
            console.log(doc)
            return res.redirect('/admin/offers/list');
        }
        
        else{
            if (err.name == 'ValidationError'){
                console.log("Err")
                handleValidationError(err, req.body);
                return res.render("./ejs/admin/offer_update.ejs",{
                        viewTitle : "Insert Offer",
                        offer : req.body
                    });
              
                
            }
            else

            console.log("Error during Record Insertion:" + err);
        }
    });

}

function updateRecord(req,res) {
    ManageOffer.findOneAndUpdate({ _id: req.body._id}, req.body, {new: true}, (err,doc) => { 
        if (!err) {
            console.log(doc)
            res.redirect('/admin/offers/list');}
        else {
            if(err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("./views/ejs/admin/offer_update.ejs", {
                    viewTitle: 'Update Offer',
                    offer: req.body
                });
            }
            else
            console.log('Error during record update:' + err);
        }
    
    });
}

function handleValidationError(err,body){
    for(field in err.errors)
    {
        switch (err.errors[field].path) {
            case 'Offer_Desc':
            body['OfferDescriptionError'] = err.errors[field].message;
            break;
            /*case 'isActivated':
            body['IsActivatedError'] = err.errors[field].message;
            break;*/
            case 'Offer_StartDate':
            body['StartDateError'] = err.errors[field].message;
            break;
            case 'Offer_EndDate':
            body['EndDateError'] = err.errors[field].message;
            break;
            default:
                break;        
        }
    }
}


module.exports = OfferController