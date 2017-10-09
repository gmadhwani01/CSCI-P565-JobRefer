var mongoose = require('mongoose');

var groupsSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    ID:{
        type: Number,
        required: true
    },
    admins:{
        type: String
    }
});

module.exports = mongoose.model('groupsInfo', groupsSchema);