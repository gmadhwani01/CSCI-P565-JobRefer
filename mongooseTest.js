
//  mongoose setup
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;


// Connect to MongoDB on localhost:27017
mongoose.connect('mongodb://localhost:27017/researchMate', { useMongoClient: true });


//  defining schema
var userSchema = mongoose.Schema({
    emailID:{
        type: String,
        required: true,
        unique:true
    },
    userName: {
        type: String,
        required: true,
        unique:true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    passWord:{
        type: String,
        required: true
    }
});


// adding a function to schema  --has to be done before using defining model
userSchema.methods.speak = function () {
    var greeting = this.name
        ? "Hello! My name is " + this.name
        : "Hi! I don't have a name.";
    console.log(greeting);
};


//  defining model
var User = mongoose.model('User', userSchema);


//  creating a document
var addUser = new User({
    emailID:'h',
    userName: 'h',
    firstName: 'j',
    lastName: 'j',
    passWord:'j'
});

//  adding a document
addUser.save(function (err) {
    if (err) return console.log("User already exists.");
    else console.log("New User Added : " + addUser.userName);
});


//  updating a document     not working properly
var query = {firstName:'j'};
User.findOneAndUpdate(query,{firstName:'x'},function(err,upUser){
    if (upUser == null)    console.log("Failed to Update.");
    else    console.log("Update Successful.");
});


//  viewing a document
User.findOne({ 'userName': 'k' }, function (err, seeUser) {
    if (seeUser == null) return console.log("Error. User not found.");
    else console.log('%s %s', seeUser.firstName, seeUser.lastName)
});


//  removing a document
var query = {"userName" : "j"};
User.remove(query,function(){
    console.log("User Removed Successfully.");
    });
