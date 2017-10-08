'use strict';

var express = require('express'),
    app = express(),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    http = require('http'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

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
var UserInfo = require('./app/userInfoModel');

function addingUser(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');

//  creating a document
    var data = req.query;

    var email = data.email;
    var username = data.username;
    var firstname = data.firstname;
    var lastname = data.lastname;
    var pwd = data.password;

    console.log();
    var addUser = new User({
        emailID: email,
        userName: username,
        firstName: firstname,
        lastName: lastname,
        passWord: pwd
    });
    var mailOptions = {
        from: 'se.researchmate@gmail.com',
        to: addUser.emailID,
        subject: 'Verification code',
        text: 'Your verification code :'+ addUser.verificationNumber
    };

//  encrypting password
    addUser.passWord = myHasher(addUser.passWord);
//  adding a document to database
    var query = {"userName": addUser.username,"emailID":addUser.emailID};
    User.findOne(query, function (err, seeUser) {
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
    })}
function updatingUser(req,res,next) { //for sprint 2
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
//  updating a document
    var data = req.query;
    var username = data.username;
    var query = {userName: username};
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
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
//  viewing a document
    var data = req.query;
    var username = data.username;
    var password = data.password;
    var query = {"userName": username};
    User.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send("userName doesn't exist in the database.");
        }
        else {
            if(bcrypt.compareSync(password,seeUser.passWord))
            {
                if(parseInt(seeUser.verificationNumber) == 1)
                    res.send("true");
                else
                    res.send("account not verified");
            }
            else
                res.send("incorrect password.");
        }}
    );
    console.log(data);
//    console.log("Performed a check for userName :" + username);
}

function deletingUser(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
//  removing a document
    var query = {"userName": req.query.username};
    User.remove(query, function () {
        console.log("User Removed Successfully.");
        res.send("Deleted the user.")
    });
}

function sayHello(req,res,next){
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
    res.send("Hello");
    console.log("said hello");
}

function checkingVerif(req,res,next){
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
    console.log("checkingVerif");
    var userName = req.query.username;
    var verNumber = req.query.verificationnumber;
    User.findOne({"userName": userName}, function (err, seeUser) {
            if (seeUser == null){
                res.send("userName doesn't exist in the database.");
                console.log("Invalid User");
            }
            else {
                if(seeUser.verificationNumber == parseInt(verNumber)) {
                    seeUser.verificationNumber = 1;
                    res.send("true");
                    console.log("user verified.");
                }
                else
                    res.send("Incorrect Verification Number!");
            }
        }
    );
}


//  accepting various calls to functions from client side
app.post('/sayHello',sayHello);
app.post('/addingUser',addingUser);
app.post('/checkingUser',checkingUser);
app.post('/deletingUser',deletingUser);
app.post('/updatingUser',updatingUser);
app.post('/checkingVerif',checkingVerif);

/*
app.use(sayHello);
app.use(addingUser);
app.use(checkingUser);
app.use(deletingUser);
app.use(updatingUser);
*/

app.listen(23456);
console.log("Server running at silo.soic.indiana.edu:23456");

// Sprint 2

function getName(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    var username = req.query.username;
    var query = {"userName":username};
    User.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send("userName doesn't exist in the database.");
        }
        else {
            res.send(seeUser.firstName + " " + seeUser.lastName);
        }}
    );
}

app.post('/getName',getName);
