'use strict';

var express = require('express'),
    app = express(),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    http = require('http'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');
	
	app.use(bodyParser.urlencoded({
    extended: true
	}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
	app.use(bodyParser.json());

mongoose.Promise = global.Promise;

//  hashing function
var myHasher = function(password) {
	if(password.trim()=="")
		return "";
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return hash;
};

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

//  sending mail using nodemailer
function sendMaill(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response +'\nto :' + mailOptions.to);
        }
    });
};

// Connect to MongoDB on localhost:27017
mongoose.connect('mongodb://localhost:27017/researchMate', { useMongoClient: true });

//  importing a pre-defined model
var User = require('./app/userModel');

function addingUser(req,res,next) {
//  creating a document
	console.log(req.body.email);
    var addUser = new User({
        emailID: 'jayendrakhandare',
        userName: 'jkhandar',
        firstName: 'jay',
        lastName: 'khandare',
        passWord: 'qwertyuiop[]'
    });

    var mailOptions = {
        from: 'se.researchmate@gmail.com',
        to: addUser.emailID+'@gmail.com',
        subject: 'Verification code',
        text: 'Your verification code :'+ addUser.verificationNumber
    };

//  encrypting password
    addUser.passWord = myHasher(addUser.passWord);
//  adding a document to database
    addUser.save(function (err) {
        if (err) {
            res.send('User already exists.');
            console.log("User already exists.");
        }
        else {
            console.log("New User Added : " + addUser.userName);
            sendMaill(mailOptions);
            res.send("New User Added : " + addUser.userName);
        }
    });
}
function updatingUser(req,res,next) { //for sprint 2
//  updating a document
    var query = {userName: 'jkhandar'};
    User.findOneAndUpdate(query, {firstName: 'Mr.Jayendra'}, function (err, upUser) {
        if (upUser == null){
            res.send('Update Failed.')
            console.log("Update Failed.");
        }
        else {
            res.send('Update successful.');
            console.log("Update Successful.");
        }
    });
}

function checkingUser(req,res,next) {
//  viewing a document
    var query = {"userName": "j"};
    User.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send("userName doesn't exist in the database.");
        }
        else {
            res.send('%s %s', seeUser.firstName, seeUser.lastName);
        }
    });
    console.log("Performed a check for userName :" + query.userName);
}

function deletingUser(req,res,next) {
//  removing a document
    var query = {"userName": "j"};
    User.remove(query, function () {
        console.log("User Removed Successfully.");
        res.send("Deleted the user.")
    });
}

function sayHello(req,res,next){
    res.send("Hello");
    console.log("said hello");
}


//  accepting various calls to functions from client side
app.post('/sayHello',sayHello);
app.post('/addingUser',addingUser);
app.post('/checkingUser',checkingUser);
app.post('/deletingUser',deletingUser);
app.post('/updatingUser',updatingUser);

/*
app.use(sayHello);
app.use(addingUser);
app.use(checkingUser);
app.use(deletingUser);
app.use(updatingUser);
*/

app.listen(23456);
console.log("Server running at silo.soic.indiana.edu:23456");
