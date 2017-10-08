var mongoose = require('mongoose');

var userInfoSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique:true
    },
    university:{
        type: String
    },
    emailID:{
        type: String,
        required: true,
        unique:true
    },
    location:{
        city:{
            type: String
        },
        state:{
            type: String
        },
        country:{
            type: String
        }
    },
    dob:{
        type:Date
    },
    primaryAdvisor:{
        type: String
    },
    secondaryAdvisor:{
        type: String
    }
});

module.exports = mongoose.model('userInfo', userInfoSchema);
