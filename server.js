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

//  importing pre-defined model
var User = require('./app/userModel');
var UserInfo = require('./app/userInfoModel');
var GroupsInfo = require('./app/groupsInfoModel');
var Group = require('./app/specificGroupInfoModel');
var Publications = require('./app/publicationsInfoModel');
var UserPublications = require('./app/userPublicationInfoModel');

function addingUser(req,res,next){
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');

//  creating a document

    var email = req.body.email;
    var username = req.body.username;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var pwd = req.body.password;

    var addUser = new User({
        emailID: email,
        userName: username,
        firstName: firstname,
        lastName: lastname,
        passWord: pwd
    });

    var addUserInfo = new UserInfo({
        userName: username,
        university:"",
        location:"",
        dob:"",
        advisor:""
    });
    addUserInfo.save(function (err) {
        if (!err){
            console.log("user added in info table");
        }
        else{
            console.log("user not added in info table");
        }
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
    })
}
app.post('/addingUser',addingUser);

function updatingUser(req,res,next) { //for sprint 2
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
//  updating a document
    var username = req.body.username;
    var newname = req.body.newname;
    var query = {userName: username};
    User.findOne(query, function (err, upUser) {
        if (upUser == null){
            res.send('Update Failed.User not found.');
            console.log("Update Failed. no user found.");
        }
        else {
            upUser.set({userName:newname});
            upUser.save(function (err,updatedUser) {
                if(err){
                    res.send("update failed");
                    console.log("Update Failed while saving.");
                }
                else {
                    res.send("Update Successful.");
                    console.log("Update Successful.");
                }
            });
        }
    });

    UserInfo.findOne(query, function (err, upUser) {
        if (upUser == null){
            res.send('Update Failed.User not found in userInfo.');
            console.log("Update Failed. no user found in userInfo.");
        }
        else {
            upUser.set({userName:newname});
            upUser.save(function (err,updatedUser) {
                if(err){
                    res.send("update failed");
                    console.log("Update Failed while saving.");
                }
                else {
                    res.send("Update Successful.");
                    console.log("Update Successful.");
                }
            });
        }
    });

}
app.post('/updatingUser',updatingUser);

function checkingUser(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
//  viewing a document
    var username = req.body.username;
    var password = req.body.password;
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
}
app.post('/checkingUser',checkingUser);

function deletingUser(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
//  removing a document
    var query = {"userName": req.body.username};
    User.remove(query, function () {
        console.log("User Removed Successfully.");
        res.send("Deleted the user.")
    });
}
app.post('/deletingUser',deletingUser);


function checkingVerif(req,res,next){
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
    console.log("checkingVerif");
    var userName = req.body.username;
    var verNumber = req.body.verificationnumber;
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
app.post('/checkingVerif',checkingVerif);

function sayHello(req,res,next){
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
    console.log(req.body);
    res.send("Hello "+req.body.name);
    console.log("said hello");
}
app.post('/sayHello',sayHello);


app.listen(23456);
console.log("Server running at silo.soic.indiana.edu:23456");

// Sprint 2
function getGroupAdmins(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
        var id = req.body.ID;
        var query = {"ID":id};
        console.log(req.body);
        GroupsInfo.findOne(query,function (err,seeGroup) {
            if(seeGroup == null){
                res.send("Group doesn't exist.")
            }
            else{
                res.send("NO");
            }
        })
}
app.post('/getGroupAdmins',getGroupAdmins);

// basic function to return fullName
function getName(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    var username = req.body.username;
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

function getPublications(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    var username = req.body.username;
    var query = {"userName":username};
    UserPublications.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send(username+" hasn't published any papers yet.");
        }
        else {
            var query2 = {"ID":seeUser.publicationID};
            Publications.findOne(query, function (err, seeUser) {
                res.send("yo");
//            res.send(seeUser.publicationID);
            })
        }
    });
}
app.post('/getPublications',getPublications);

function getGroups(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    var username = req.body.username;
    var query = {"userName":username};
    Group.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send(username+" is not in any group.");
        }
        else {
            res.send(JSON.stringify(seeUser));
        }}
    );
}
app.post('/getGroups',getGroups);

function getUniversity(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    var username = req.body.username;
    var query = {"userName":username};
    UserInfo.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send(username+"has not set any university field.");
        }
        else {
            res.send(JSON.stringify(seeUser.university));
        }}
    );
}
app.post('/getUniversity',getUniversity);

function getAdvisor(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    var username = req.body.username;
    var query = {"userName":username};
    UserInfo.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send(username+"has not set Advisor field yet.");
        }
        else {
            res.send(JSON.stringify(seeUser.advisor));
        }}
    );
}
app.post('/getAdvisor',getAdvisor);

function getLocation(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    var username = req.body.username;
    var query = {"userName":username};
    UserInfo.findOne(query, function (err, seeUser) {
        if (seeUser == null){
            res.send(username+"has not set location field yet.");
        }
        else {
            res.send(JSON.stringify(seeUser.location));
        }}
    );
}
app.post('/getLocation',getLocation);

function setUserInfo(req,res,next) {
//  setting up the header configurations
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST');
//  updating a document
    var username = req.body.username;
    var query = {userName: username};
    console.log(req.body.university);
    UserInfo.findOne(query, function (err, upUser) {
        if (upUser == null){
            res.send('Update Failed.User not found.');
            console.log("Update Failed. no user found.");
        }
        else {
            upUser.set({university: req.body.university});
            upUser.set({location:{city: req.body.city,state:req.body.state,country:req.body.country}});
            upUser.set({dob: req.body.dob});
            upUser.set({advisor:{primary: req.body.primaryAdvisor, secondary: req.body.secondaryAdvisor}});

            upUser.save(function (err,updatedUser) {
                if(err){
                    res.send("update failed");
                    console.log("Update Failed while saving.");
                }
                else {
                    res.send("Update Successful.");
                    console.log("Update Successful.");
                }
            });
        }
    });
}
app.post('/setUserInfo',setUserInfo);
