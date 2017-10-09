var mongoose = require('mongoose');

var groupSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique:true
    },
    userType: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('specificGroupInfo', groupSchema);
