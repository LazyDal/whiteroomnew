'use strict';

var Promise = require('es6-promise').Promise;
var express = require('express');
var redis   = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var redisClient  = redis.createClient();
var formidable = require('formidable');
var fs = require('fs');
// This require will connect Mongoose ORM to the running MongoDB database instance
require('./server/MongooseTestConnection');
var credentials = require('./config/credentials');

// Key object containing user management related methods
var userManagement = require('./server/userManagement');
// Require Mongoose models that the server will need
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
    store: new redisStore({ host: 'localhost', port: 6379, client: redisClient,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));

//
//
// Routes
//
//

server.get('/', function(req,res){
	if (req.session.userName) {	// User logged in
		res.end('<a href="#">Edit User Profile</a><br /><a href="http://localhost:3000/getAllLoggedInUsers">Show Logged In Users Test</a><br /><form action="http://localhost:3000/api/logout" method="GET"><button type="submit">Log Out</button></form>');
	}
	else {	// Anonymous user
		res.end('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Whiteroom LogIn</title></head><body><h1>Logging In To Whiteroom</h1><form action="http://localhost:3000/api/login" method="POST"><fieldset id="name-group" class="form-group"><label for="userName">User Name</label><input type="text" class="form-control" name="userName" placeholder="User Name"><button type="submit">Log In</button></fieldset></form><a href="http://localhost:3000/test/addprofile.html">Add New Profile Test</a><br /><a href="http://localhost:3000/getAllLoggedInUsers">Show Logged In Users Test</a></body></html>');
	}
});

// Try to log in user
server.post('/api/login',function(req,res){
    // This function looks in the redis store to see if this user is already logged in; this will be true if there is a key 'user:[username]'
    var checkExistingRedisSession = new Promise(function(resolve, reject) {
    	// redis get key command
    	redisClient.get("user:" + req.body.userName, function(err, reply) {
        // reply is null when the key is missing
        if(reply) {
        	res.end("<h1>This user is already logged in on another client machine.</h1>");
        	reject();
        }
        else resolve();
    });
  });
  // After making sure the user is not already logged in, continue to check that the user exists in the MongoDB database
  checkExistingRedisSession.then(function(){
  	userManagement.checkUserExistence(req.body.userName).then(
  		function (result) {
  			if (result === "already exists.") {
  				// User exists, O.K.
  				req.session.userName = req.body.userName;	// basic session key; will be saved as a hashed key into redis store
  				// The following key we set in redis store so that we can search for it to know if the user is logged in. Value of the key is the name of the root room and is not important
  				redisClient.set("user:"+req.body.userName, "RootRoom");
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
});

server.get('/api/logout',function(req,res){
    // remove user entry from redis
    redisClient.del("user:"+req.session.userName);
    // remove the user session
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
			userImage.tmpPath = files.image.path;
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
			res.end(JSON.stringify(reason));	// TODO
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
server.get('/getAllLoggedInUsers', function(req, res){
	var cursor = '0';
	var loggedInUsers = [];

	scan();	// loggedInUsers are set as a side-effect, but idealy scan() would return the result without using this 'global' variable

	function scan() {
	    redisClient.scan(
	        cursor,
	        'MATCH', 'user:*',
	        'COUNT', '10',
	        function(err, result) {
	            var i;
	            if (err) throw err;	// TODO

	            // Update the cursor position for the next scan
	            cursor = result[0];
	            // get the SCAN result for this iteration
	            var keys = result[1];

	            // Remember: more or less than COUNT or no keys may be returned
	            // See http://redis.io/commands/scan#the-count-option
	            // Also, SCAN may return the same key multiple times
	            // See http://redis.io/commands/scan#scan-guarantees
	            // Additionally, you should always have the code that uses the keys
	            // before the code checking the cursor.
	            if (keys.length > 0) {
	                for (i=0; i < keys.length; ++i) {
	                	loggedInUsers.push(keys[i]);	
	                }
	                console.log('Array of matching keys', keys);
	            }

	            // It's important to note that the cursor and returned keys
	            // vary independently. The scan is never complete until redis
	            // returns a zero cursor. However, with MATCH and large
	            // collections, most iterations will return an empty keys array.

	            // Still, a cursor of zero DOES NOT mean that there are no keys.
	            // A zero cursor just means that the SCAN is complete, but there
	            // might be one last batch of results to process.

	            // From <http://redis.io/commands/scan>:
	            // 'An iteration starts when the cursor is set to 0,
	            // and terminates when the cursor returned by the server is 0.'
	            if (cursor === '0') {
	                console.log('Iteration complete');
	                res.end(JSON.stringify(loggedInUsers));
	                return;
	            }

	            return scan();
	        }
	    );
	}
}); 

// Start the server
server.listen(server.get('port'));
console.log('Running on http://localhost: ' + server.get('port'));