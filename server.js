'use strict';

var Promise = require('es6-promise').Promise;
var express = require('express');
var redis   = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var client  = redis.createClient();
var formidable = require('formidable');
var fs = require('fs');

require('./server/MongooseTestConnection');
var credentials = require('./config/credentials');

// Key object containing user management related methods
var userManagement = require('./server/userManagement');

var UserImage = require('./model/UserSchema').UserImage;
var User = require('./model/UserSchema').User;
// App
var server = express();

// HTTP listening port
server.set('port', process.env.PORT || 3000);

// define static folder
server.use(express.static(__dirname + '/static'));

// body parser middleware
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}));

// redis session middleware
server.use(session({
    secret: credentials.cookieSecret,
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));

// Routes
server.get('/', function(req,res){
	if (req.session.userName) {
		res.end('<a href="#">Edit User Profile</a><br /><a href="#">Show Logged In Users Test</a><br /><form action="http://localhost:3000/api/logout" method="GET"><button type="submit">Log Out</button></form>');
	}
	else {
		res.end('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Whiteroom LogIn</title></head><body><h1>AJAX Logging In To Whiteroom</h1><form action="http://localhost:3000/api/login" method="POST"><fieldset id="name-group" class="form-group"><label for="userName">User Name</label><input type="text" class="form-control" name="userName" placeholder="User Name"><button type="submit">Log In</button></fieldset></form><a href="#">Add New Profile Test</a><br /><a href="#">Show Logged In Users Test</a></body></html>');
	}
});

server.post('/api/login',function(req,res){
    userManagement.checkUserExistence(req.body.userName).then(
    	function (result) {
    		if (result === "already exists.") {
    			req.session.userName = req.body.userName;
    			res.redirect('/');
    		} 
    		else {
    			res.end("<h1>This user doesn't exist</h1>");
    		}
    	}
    ).catch(function(reason) {
    	res.end("<h1>Log in failed due to server error: </h1>" + reason);
    });
});

server.get('/api/logout',function(req,res){
    req.session.destroy(function(err){
        if(err){
            res.end("<h1>Log out failed due to server error: </h1>" + reason);;
        } else {
            res.redirect('/');
        }
    });
});

// Test Routes, TODO: delete for production
server.post('/api/addprofile', function(req, res){
	var form = new formidable.IncomingForm();
	var userImage = null;
	form.parse(req, function(err, fields, files){
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		// prepare an img in binary for mongo
		if (files.image.size > 0) {
			userImage = new UserImage;
			userImage.data = fs.readFileSync(files.image.path);
			userImage.contentType = files.image.type;
		}
		var newUser = new User({
			userName: fields.userName,
			realName: fields.realName,
			email: fields.email,
			password: fields.password,
			country: fields.country,
			phone: fields.phone,
			age: fields.age,
			sex: fields.sex,
			status: fields.status,
			interestedIn: fields.interestedIn,
			image: userImage,
			createdOn: Date.now(),		
			lastAction: Date.now(),
			totalPosts: 0,
			totalTopicsStarted: 0,
			points: 0
	  });

    userManagement.newUser(newUser).then(	
			function (results) {
			  res.end(JSON.stringify(results));
			}
		).catch(function(reason){
			res.end(JSON.stringify(reason));
		});
	});
});
server.get('/placeholderimage', function(req, res) {
	res.end('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Whiteroom LogIn</title></head><body><img src="http://localhost:3000/placeholderimagesrc"></img></body></html>');
});
server.get('/placeholderimagesrc', function (req, res) {
    UserImage.findOne({name:"userImagePlaceholder"}, function (err, img) {
      if (err) throw (err);
    	console.log(img.contentType);
      res.contentType("image/jpeg");
      res.end(img.data);
    });
  });

// Start the server
server.listen(server.get('port'));
console.log('Running on http://localhost: ' + server.get('port'));