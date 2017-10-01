'use strict';

var express = require('express'),
    app = express(),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    http = require('http'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

mongoose.Promise = global.Promise;

//  nodemailer setup
var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secureConnection: true,
    auth: {
        user: 'se.researchmate@gmail.com',
        pass: 'agileteam'
    }
}));
var mailOptions = {
    from: 'se.researchmate@gmail.com',
    to: 'jayendrakhandare@gmail.com',
    subject: 'Sending Email using Node.js[nodemailer]',
    text: 'Test Successful!'
};


//  hashing function
var myHasher = function(password) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return hash;
};

// Connect to MongoDB on localhost:27017
mongoose.connect('mongodb://localhost:27017/researchMate', { useMongoClient: true });

//  importing a pre-defined model
var User = require('./app/userModel');

/*
//  creating a document
var addUser = new User({
    emailID:'7',
    userName: '8',
    firstName: 'j',
    lastName: 'j',
    passWord:'jdkflhg'
});

//  encrypting password
addUser.passWord = myHasher(addUser.passWord);
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
*/


/*
app.get('/',function(req,res){
    res.send('app/htmls/index.html');
});

app.listen(4500);
console.log("Listening at localhost:4500");
*/

//to put a html page
http.createServer(function (req, res) {
    fs.readFile('./app/htmls/login.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });

}).listen(8080);


//  sending mail using nodemailer
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
