const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        maxLength : 30
    },
    email : {
        type : String,
        required : true,
        maxLength : 30
    },
    phone_no : {
        type : Number,
        required : true,
        maximum : 10
    },
    password : {
        type : String,
        required : true,
        maxLength : 150
    },
    isUser : {
        type : Boolean,
        default : true
    },
    isActivated : {
        type : Boolean,
        default : true
    },
    resetLink : {
        data : String,
        default : ''
    }
}
)

const User = mongoose.model('User',userSchema)

module.exports = User