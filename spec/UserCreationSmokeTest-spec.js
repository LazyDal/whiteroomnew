"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

//
// For the following tests MongoDB must be installed and running
// placeholder image must be saved to MongoDB
// You can insert it by entering the spec directory and typing 'node insertplaceholderimage.js'
//

// Functionality common to several User-related modules
var userCommon = require('../server/userCommon.js');

// Unit Under Test
var userProfile = require('../server/userProfile');

/****************************************************************/
/* Objects which will be used as arguments for the tests follow */
/****************************************************************/

/* User Image Mongoose model - we will provide null as a value of user image    */
var UserImage = require('../model/UserSchema').UserImage;

/* Import User List model */
var UserList = require('../model/UserSchema').UserList;
// Create user list instance
var userList = new UserList({
	name:'ListName',
	users: null
});
/* User model */
var User = require('../model/UserSchema.js').User;
// Create user instance
var user = new User({
	userName: 'AnExistingName',
	realName: 'Real Name',
	email: 'some@domain.com',
	password: 'somepassword',
	country: 'some country',
	phone: '+xxx yy zzz-zzz',
	age: 250,
	sex: 'Female',
	status: 'In relation',
	interestedIn: 'Men',
	image: null,
	userLists: userList,
	createdOn: Date.now(),
	lastAction: Date.now(),
	totalPosts: 42,
	totalTopicsStarted: 12,
	points: 10
});


describe("Succsefull User Sign Up Process:", function () {

	describe("The User Object:", function() {
		it("should exist", function () {
			expect(user).toBeDefined();
		});
		it("should contain all the needed fields", function() {
			expect(user.userName).toBeDefined();
			expect(user.realName).toBeDefined();
			expect(user.email).toBeDefined();
			expect(user.password).toBeDefined();
			expect(user.country).toBeDefined();
			expect(user.phone).toBeDefined();
			expect(user.age).toBeDefined();
			expect(user.sex).toBeDefined();
			expect(user.status).toBeDefined();
			expect(user.interestedIn).toBeDefined();
			expect(user.image).toBeDefined();
			expect(user.userLists).toBeDefined();
			expect(user.createdOn).toBeDefined();
			expect(user.lastAction).toBeDefined();
			expect(user.totalPosts).toBeDefined();
			expect(user.totalTopicsStarted).toBeDefined();
			expect(user.points).toBeDefined();
		}); // it
	}); // describe

	describe("The User List Object:", function() { 
		it("should exist", function() {
			expect(userList).toBeDefined();
		});
		it("should contain all the needed fields", function() { 
			expect(userList.name).toBeDefined();
			expect(userList.users).toBeDefined();
		});
	});

	describe("The User management object:", function(){
		it("should exist", function(){
			expect(userProfile).toBeDefined();
		});
		it ("should contain all the neccesary methods" , function(){
			expect(userProfile.newUserValidation).toBeDefined();
			expect(userProfile.updateUserValidation).toBeDefined();
			expect(userProfile.newUser).toBeDefined();
			expect(userProfile.updateUser).toBeDefined();
			expect(userProfile.updateUserDB).toBeDefined();
			expect(userProfile.saveUser).toBeDefined();
			expect(userProfile.getUserProfile).toBeDefined();
			expect(userProfile.getUserImage).toBeDefined();
			expect(userProfile.hashPassword).toBeDefined();
			expect(userProfile.trimFieldSpaces).toBeDefined();
		});
	});

	describe("New User Creation Process:", function () {
		var validationResults;

		// We will test some async functions so we need the special Jasmine done() argument
	 	beforeEach(function(done) {
			// These spies will also actually execute the spied on methods because of andCallThrough() methods
			spyOn(userProfile, 'newUser').andCallThrough();
			spyOn(userProfile, 'trimFieldSpaces').andCallThrough();
			spyOn(userProfile, 'newUserValidation').andCallThrough();
			spyOn(userProfile, 'hashPassword');
			spyOn(userProfile, 'saveUser').andCallThrough();
			// Now we envoke the function which orchestrates the new user creation process; it returns a promise, since it uses several async functions
	    // Try to create new user
	    userProfile.newUser(user).then(	// This is quite a complex process where all validation must happen first
 				function (results) {
				  validationResults = results;
		      console.log("Validation results: " + validationResults);
		      // Invoke the special Jasmine done callback; no further tests will run before this function is invoked
		      done();
 				}
 			).catch(function(reason){
 				console.log(reason);
 				done();
 			});
	  });
		it("should have validated the user object argument, hashed the password and called saveUser method", function() {
			expect(userProfile.trimFieldSpaces).toHaveBeenCalled();
			expect(userProfile.newUserValidation).toHaveBeenCalled();
			expect(validationResults).toEqual(undefined);	// If validation is passed, validation results will be undefined
			expect(userProfile.hashPassword).toHaveBeenCalled();
			expect(typeof(userProfile.hashPassword.mostRecentCall.args[0])).toMatch("string");
			expect(userProfile.saveUser).toHaveBeenCalled();
			expect(userProfile.saveUser.mostRecentCall.args[0] instanceof User).toBe(true);
			
			mongoose.connection.close();
		}); // it
	}); // describe

}); // describe
	