"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

var userProfile = require('../server/userProfile');

var MongoDBTestCredentials = require('../config/MongoDBTestCredentials');

// Create the database connection 
mongoose.connect(MongoDBTestCredentials.dbURI);

var User = require('../model/UserSchema.js').User;
var user = new User({
	userName:"  Name Name  ",
	email: "some@email.TLD",
	age: 3
});

describe("Invalid user field values handling during the sign-up process", function() {
	var validationResults;

	beforeEach(function(done) {
		spyOn(userProfile, 'saveUser');
    userProfile.newUser(user).then(	
				function (results) {
				  validationResults = results;
		      console.log('\n' + JSON.stringify(validationResults) + '\n');
	  	    // Invoke the special Jasmine done callback; no further tests will run before this function is invoked
	    	  done();
				}
			).catch(function(err){
				console.log("Error: " + err);
				done();
			});
	});	
	it("should reject invalid user name and age and complain about the missing password; should return an object about these errors", function(){
		expect(userProfile.saveUser).not.toHaveBeenCalled();
		expect(validationResults).not.toEqual({});
		// prepare the user object for next assertion
		user.userName = " NameName ";
		user.password = "goodone";
		user.email= "!what?@#4.!@#";
	});
	it("should reject invalid age and email and return an object about errors", function() {
		expect(userProfile.saveUser).not.toHaveBeenCalled();
		expect(validationResults).not.toEqual({});
		// prepare the user object for next assertion
		user.userName = "AnExistingName";
		user.email = "some@domain.com";
		user.age = 7;
		user.password = "four";
	});
	it("should reject the existing user name 'AnExistingName', the existing email, and short password and return an object about errors", function(done) {
		expect(userProfile.saveUser).not.toHaveBeenCalled();
		expect(validationResults).not.toEqual({});
		// mongoose.connection.close(function () {
					done();
		// });
	})
});

