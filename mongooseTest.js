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


//  hashing function
var myHasher = function(password) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return hash;
};

function setupMongo() {
// Connect to MongoDB on localhost:27017
    mongoose.connect('mongodb://localhost:27017/researchMate', { useMongoClient: true });

//  importing a pre-defined model
    var User = require('./app/userModel');
}

setupMongo();

function addingUser() {
//  creating a document
    var addUser = new User({
        emailID: 'def',
        userName: 'ff',
        firstName: 'j',
        lastName: 'j',
        passWord: 'jdkflhg'
    });

//  encrypting password
    addUser.passWord = myHasher(addUser.passWord);
//  adding a document to database
    addUser.save(function (err) {
        if (err) return console.log("User already exists.");
        else console.log("New User Added : " + addUser.userName);
    });

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
        text: 'Added'
    };

    sendMaill();
}
function updatingUser() {
//  updating a document
    var query = {firstName: 'j'};
    User.findOneAndUpdate(query, {firstName: 'x'}, function (err, upUser) {
        if (upUser == null) console.log("Failed to Update.");
        else console.log("Update Successful.");
    });
}

function checkingUser() {
//  viewing a document
    User.findOne({'userName': 'k'}, function (err, seeUser) {
        if (seeUser == null) return false;
        else {
            console.log('%s %s', seeUser.firstName, seeUser.lastName);
            return true;
        }
    });
};

function deletingUser() {
//  removing a document
    var query = {"userName": "j"};
    User.remove(query, function () {
        console.log("User Removed Successfully.");
        return true;
    });
}

var sayHello = function(req,res,next){
	res.send("Hello");
	console.log(req);
};

//app = connect();
app.use(sayHello);
app.listen(23456);
console.log("Server running at silo.soic.indiana.edu:23456");

//  sending mail using nodemailer
function sendMaill() {
transporter.sendMail(mailOptions, function(error, info){
	if (error) {
           console.log(error);
        } else {
           console.log('Email sent: ' + info.response);
        }
});    
}
